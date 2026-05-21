const mongoose = require("mongoose");
const dns = require('dns');

const DEFAULT_LOCAL = "mongodb://127.0.0.1:27017/barber_booking";
const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URL || process.env.MONGO_URI || DEFAULT_LOCAL;

// Only attempt local fallback when explicitly allowed (avoid silent data divergence)
const ALLOW_LOCAL_FALLBACK = String(process.env.DB_FALLBACK_TO_LOCAL || 'false').toLowerCase() === 'true';
const MONGO_DNS_SERVERS = process.env.MONGO_DNS_SERVERS || '';
const parsedDnsServers = MONGO_DNS_SERVERS ? MONGO_DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean) : null;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const redactUri = (uri) => {
    if (!uri) return uri;
    try {
        // mask credentials if present
        return uri.replace(/([^:\/]+):([^@]+)@/, 'REDACTED:REDACTED@');
    } catch (e) {
        return 'REDACTED_URI';
    }
};

const connect = async() => {
    if (mongoose.connection && mongoose.connection.readyState === 1) return mongoose.connection;

    const uriType = MONGO_URI && MONGO_URI.startsWith('mongodb+srv') ? 'mongodb+srv' : 'mongodb';
    const shownUri = redactUri(MONGO_URI);

    // If using SRV, try a few times because DNS lookups can fail intermittently
    const maxAttempts = MONGO_URI && MONGO_URI.startsWith('mongodb+srv') ? 3 : 1;
    let attempt = 0;
    let lastErr;
    const originalDnsServers = dns.getServers();
    let dnsChanged = false;

    try {
        // if the user provided DNS servers (comma-separated), set them for SRV resolution
        if (parsedDnsServers && uriType === 'mongodb+srv') {
            try {
                dns.setServers(parsedDnsServers);
                dnsChanged = true;
                console.log(`Using custom DNS servers for SRV resolution: ${parsedDnsServers.join(', ')}`);
            } catch (e) {
                console.warn('Failed to set custom DNS servers:', e && e.message ? e.message : e);
            }
        }

        while (attempt < maxAttempts) {
            attempt++;
            try {
                if (attempt > 1) {
                    console.log(`Retrying MongoDB (${uriType}) connection attempt ${attempt}/${maxAttempts} to ${shownUri}...`);
                }
                return await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            } catch (err) {
                lastErr = err;
                const msg = err && err.message ? err.message : String(err);
                console.error(`MongoDB connection attempt ${attempt} (${uriType}) to ${shownUri} failed:`, msg);
                // small backoff before retrying
                if (attempt < maxAttempts) await sleep(500 * attempt);
            }
        }
    } finally {
        // restore original DNS servers so other parts of the app are not affected
        if (dnsChanged) {
            try {
                dns.setServers(originalDnsServers || []);
                console.log('Restored original DNS servers after SRV attempts');
            } catch (e) {
                console.warn('Failed to restore original DNS servers:', e && e.message ? e.message : e);
            }
        }
    }

    // If we reach here, initial connection attempts failed
    // In development, optionally allow a local fallback when explicitly enabled
    if (ALLOW_LOCAL_FALLBACK && process.env.NODE_ENV !== 'production' && MONGO_URI && MONGO_URI.startsWith('mongodb+srv')) {
        try {
            console.warn(`Initial MongoDB (${uriType}) failed. Attempting local fallback MongoDB at ${DEFAULT_LOCAL}`);
            return await mongoose.connect(DEFAULT_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true });
        } catch (err2) {
            console.error('Local fallback MongoDB connection failed:', err2 && err2.message ? err2.message : err2);
            throw err2;
        }
    }

    // Provide a clear, actionable error for SRV DNS failures
    if (lastErr) {
        const msg = lastErr && lastErr.message ? lastErr.message : String(lastErr);
        console.error('Final MongoDB connection error:', msg);
        if (MONGO_URI && MONGO_URI.startsWith('mongodb+srv')) {
            console.error('Note: SRV (mongodb+srv) connection failed. If you are behind a DNS-blocking network or using custom DNS, consider:\n  - Ensuring your system DNS allows SRV lookups for cluster hostnames\n  - Using a full `mongodb://host1,host2,.../dbname` connection string instead of `mongodb+srv`\n  - Setting `DB_FALLBACK_TO_LOCAL=true` to allow a local fallback in development (not recommended for production)');
        }
    }

    throw lastErr || new Error('Unable to connect to MongoDB');
};

const disconnect = async() => mongoose.disconnect();

module.exports = { connect, disconnect, MONGO_URI };
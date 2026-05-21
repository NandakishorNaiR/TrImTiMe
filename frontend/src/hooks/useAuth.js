import { useContext } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';

export default function useAuth() {
    const ctx = useAuthContext();
    return ctx;
}
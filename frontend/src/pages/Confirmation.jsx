import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";

const Confirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 via-neutral-50 to-accent-50 p-4">
      <Card shadow="2xl" className="w-full max-w-md text-center space-y-8">
        <div>
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-h2 font-bold text-neutral-900">Booking Confirmed!</h1>
          <p className="text-body text-neutral-600 mt-2">
            Your slot has been successfully booked
          </p>
        </div>

        <Button
          fullWidth
          variant="primary"
          size="lg"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default Confirmation;

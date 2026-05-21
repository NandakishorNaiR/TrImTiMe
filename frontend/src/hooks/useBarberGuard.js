import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const useBarberGuard = () => {
    const nav = useNavigate();

    useEffect(() => {
        api.get("/barber/shop")
            .then(res => {
                if (!res.data) nav("/barber/shop-setup");
            })
            .catch(() => nav("/barber/shop-setup"));
    }, [nav]);
};

export default useBarberGuard;
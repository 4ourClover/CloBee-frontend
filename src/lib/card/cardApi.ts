import axios from "axios"
import { CardPageDTO } from "./cardTypes"

export const fetchAllCards = async (
    cardType: string, page: number, size: number
): Promise<CardPageDTO> => {
    const response = await axios.get("http://localhost:8080/api/card/getCardList", {
        params: { cardType, page, size }
    })
    return response.data
}
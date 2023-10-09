// importing axios for api call
const axios = require('axios');
exports.getQuestion = async (quantity) => {
    const apiUrl = `https://opentdb.com/api.php?amount=${quantity}`;
    try {
        const response = await axios.get(apiUrl);
        const questions = response.data.results;
        return questions;
    } catch (error) {
        console.error('Error fetching questions:', error);
        return null;
    }
};
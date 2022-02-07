/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51KPPXjKnQPrsQHeXaVkJjLvmttffCEzSpeYbnSOYcOeeUeObctYsElgL7p6pYPahTkX3cofJcH7OVGfx15iz7W7500b7mKh3zs');

export const bookTour = async (tourId) => {
    try {      
        // 1) Get checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`);
        console.log(session);
        // 2) Create checkout form + charge credit card
        location.replace(session.data.session.url)
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // })
    } catch (err) {
        console.log(err);
        showAlert('error', err)
    }

}
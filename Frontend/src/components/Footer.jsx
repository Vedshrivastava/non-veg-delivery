import React from 'react'
import '../styles/Footer.css'
import { assets } from '../assets/frontend_assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img alt="" />
                <p>Thank you for visiting Shri’s Restaurant! We take pride in serving delicious and authentic cuisine with a touch of warmth and hospitality. For inquiries or reservations, feel free to contact us. Stay connected through our social media channels for the latest updates and special offers. We look forward to welcoming you again!</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>Get In Touch</h2>
                <ul>
                    <li>+1-34-56-3463</li>
                    <li>shdfbufsgs234@gmail.com</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className="footer-copyright">Copyright text</p>
    </div>
  )
}

export default Footer
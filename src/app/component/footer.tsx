import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-black flex flex-col-reverse lg:flex-row text-white p-10 justify-center lg:justify-around">
            <div className="flex flex-col">
                <div className="flex flex-row gap-4 items-center justify-center py-4">
                    <Image src="/eqariah.svg" alt="logo" width={100} height={100} className='dark:invert' />
                    <h1 className="text-3xl font-bold ">Eqariah</h1>
                </div>
                <p>Copyright © 2025 Irsad Gamma</p>
                <p className="py-4">All rights reserved</p>
                <ul className="flex gap-5">
                </ul>
            </div>

            <div className="flex flex-col justify-center lg:ml-72">
                <h1 className="py-4 font-bold text-lg lg:text-2xl">Company</h1>
                <a className="text-gray-300">About us</a>
                <a className="text-gray-300">Blog</a>
                <a className="text-gray-300">Contact us</a>
                <a className="text-gray-300">Pricing</a>
                <a className="text-gray-300">Testimonials</a>
            </div>

            <div className="flex flex-col justify-center">
                <h1 className="font-bold py-4 text-lg lg:text-2xl">Support</h1>
                <a className="text-gray-300">Help center</a>
                <a className="text-gray-300">Terms and services</a>
                <a className="text-gray-300">Legal</a>
                <a className="text-gray-300">Privacy policy</a>
                <a className="text-gray-300">Status</a>
            </div>

            <div className="flex flex-col justify-center">
                <h1 className="text-lg lg:text-2xl font-bold pb-4">Stay up to date</h1>
                <div className="relative">
                    <input
                        name="email"
                        placeholder="Your email address"
                        className="bg-gray-500 placeholder-slate-200 rounded py-2 px-4 w-full"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Image src="/send.svg" alt="Subscribe" width={30} height={30} className="dark:invert" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
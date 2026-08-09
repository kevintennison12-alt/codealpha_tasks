/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { User, Product, Order, Coupon, Review, SalesStat, CategoryShare } from './src/types';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_ECOM_JWT_KEY';
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Seed initial data
const initialCoupons: Coupon[] = [
  { code: 'SAVE10', discountPercent: 10, minSpend: 3999, description: 'Get 10% off on orders above ₹3,999' },
  { code: 'WELCOME20', discountPercent: 20, minSpend: 7999, description: 'Get 20% off on orders above ₹7,999 for your warm welcome' },
  { code: 'FREESHIP', discountPercent: 0, minSpend: 1999, description: 'Free shipping on orders above ₹1,999' },
  { code: 'SUPER30', discountPercent: 30, minSpend: 14999, description: 'Unlock 30% off on orders above ₹14,999' },
];

const initialProducts: Product[] = [
  // Category: Electronics
  {
    id: 'p1',
    name: 'AeroSound Pro Wireless Headphones',
    description: 'Experience deep immersive sound with advanced hybrid Active Noise Cancellation, 40-hour long-lasting battery life, ultra-plush memory foam earcups, and high-fidelity audio drivers engineered for studio-quality acoustics.',
    price: 199.99,
    discount: 15,
    category: 'Electronics',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviews: [
      { id: 'r1', userId: 'u2', userName: 'Alex Customer', rating: 5, comment: 'Incredible noise cancellation! The soundstage is wide and crispy clear.', date: '2026-06-15' },
      { id: 'r2', userId: 'u3', userName: 'John Doe', rating: 4.5, comment: 'Super comfortable for long flights. Bass response is highly impressive.', date: '2026-07-02' }
    ],
    brand: 'AeroSound',
    specifications: { 'Battery Life': '40 Hours', 'Bluetooth': 'v5.3', 'Noise Cancellation': 'Hybrid ANC', 'Weight': '250g' }
  },
  {
    id: 'p2',
    name: 'Chronos Smartwatch Elite',
    description: 'Track your fitness, heart rate, sleep quality, and daily activities with a striking 1.43" AMOLED display. Features premium stainless steel bezel, built-in dual-band GPS, 5ATM water resistance, and up to 14 days of dynamic battery life.',
    price: 249.99,
    discount: 10,
    category: 'Electronics',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviews: [
      { id: 'r3', userId: 'u2', userName: 'Alex Customer', rating: 4, comment: 'Highly precise GPS tracker. The screen brightness is amazing even under bright sunlight.', date: '2026-06-20' }
    ],
    brand: 'Chronos',
    specifications: { 'Display': '1.43 inch AMOLED', 'Water Resistance': '5ATM (50m)', 'Battery': '14 Days Typical Use', 'Sensors': 'PPG Heart Rate, SpO2, Accelerometer' }
  },
  {
    id: 'p3',
    name: 'Vortex Mechanical Keyboard',
    description: 'A 75% compact mechanical keyboard engineered with hot-swappable linear mechanical switches, sound-absorbing dampening foam, premium dye-subbed PBT keycaps, and customizable per-key dynamic RGB backlighting.',
    price: 129.99,
    discount: 20,
    category: 'Electronics',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviews: [
      { id: 'r4', userId: 'u3', userName: 'John Doe', rating: 5, comment: 'The sound profiles are marvelous right out of the box. Keycaps feel highly premium.', date: '2026-07-01' }
    ],
    brand: 'Vortex',
    specifications: { 'Form Factor': '75% Layout', 'Switches': 'Vortex Yellow Linear', 'Connectivity': 'USB-C / 2.4G / BT5.0', 'Hot-swappable': 'Yes, 3/5-pin' }
  },
  {
    id: 'p4',
    name: 'Titanium Swift Laptop',
    description: 'Thin, ultra-light aluminum housing equipped with latest-gen 14-core processor, 16GB unified RAM, 512GB PCIe Gen 4 SSD, and a stunning 14-inch 120Hz micro-edge display designed for demanding creators and developers.',
    price: 1199.99,
    discount: 5,
    category: 'Electronics',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviews: [],
    brand: 'Titanium',
    specifications: { 'Processor': 'Intel Ultra 7 / AMD Ryzen 7', 'RAM': '16GB LPDDR5X', 'Storage': '512GB PCIe NVMe SSD', 'Weight': '1.28 kg' }
  },
  {
    id: 'p5',
    name: 'AeroLumen HD Projector',
    description: 'Turn your living room into a cinematic arena with 2000 ANSI Lumens brightness, native 1080p output (4K supported), smart auto-keystone correction, dual 10W Dolby audio speakers, and seamless Android TV streaming.',
    price: 349.99,
    discount: 15,
    category: 'Electronics',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop'
    ],
    rating: 4.5,
    reviews: [],
    brand: 'AeroLumen',
    specifications: { 'Brightness': '2000 ANSI Lumens', 'Resolution': 'Native 1080p', 'OS': 'Android TV 11', 'Contrast Ratio': '10,000:1' }
  },
  {
    id: 'p6',
    name: 'Pulse Go Waterproof Speaker',
    description: 'IPX7 certified portable Bluetooth speaker offering deep punchy bass, 360-degree expansive sound, up to 15 hours of battery life, and rugged shockproof outer fabrication optimized for beach and poolside adventures.',
    price: 79.99,
    discount: 25,
    category: 'Electronics',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529336953128-a85760f58cb5?w=600&auto=format&fit=crop'
    ],
    rating: 4.4,
    reviews: [],
    brand: 'PulseSound',
    specifications: { 'Output': '20W RMS', 'Waterproofing': 'IPX7', 'Battery Life': '15 Hours', 'Bluetooth': 'v5.1' }
  },

  // Category: Fashion
  {
    id: 'p7',
    name: 'Denim Classic Trucker Jacket',
    description: 'Timeless outerwear style meticulously woven from high-durability heavyweight 100% cotton denim, featuring a relaxed fit, custom button closures, front chest pockets, and side welt pockets for ultimate lifestyle comfort.',
    price: 89.99,
    discount: 10,
    category: 'Fashion',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1481824429379-07aa5e5b0739?w=600&auto=format&fit=crop'
    ],
    rating: 4.5,
    reviews: [
      { id: 'r5', userId: 'u2', userName: 'Alex Customer', rating: 5, comment: 'Sizing fits exactly as described. Outstanding texture and thickness.', date: '2026-06-25' }
    ],
    brand: 'VibeFashion',
    specifications: { 'Material': '100% Cotton Denim', 'Fit': 'Regular Fit', 'Style': 'Trucker', 'Care': 'Machine Wash Cold' }
  },
  {
    id: 'p8',
    name: 'Dynamic Flex Running Shoes',
    description: 'Engineered performance sneakers equipped with responsive rebound foam midsoles, breathable multi-knit mesh uppers, structural midfoot stability cages, and grip-focused carbon rubber outer treads for all-weather traction.',
    price: 139.99,
    discount: 15,
    category: 'Fashion',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviews: [],
    brand: 'Velocity',
    specifications: { 'Midsole': 'Rebound EVA Foam', 'Upper': 'Engineered Mesh', 'Weight': '280g (Size 9)', 'Drop': '8mm' }
  },
  {
    id: 'p9',
    name: 'Heavyweight Minimalist Hoodie',
    description: 'An elegant premium casual sweatshirt crafted with a hefty 450 GSM French Terry cotton blend, featuring dropped shoulders, double-layered roomy hoods, and a clean logo-less aesthetic tailored for effortless modern styling.',
    price: 69.99,
    discount: 20,
    category: 'Fashion',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviews: [],
    brand: 'MinimalLabel',
    specifications: { 'Material': '80% Cotton, 20% Polyester', 'Weight': '450 GSM', 'Country': 'Portugal', 'Cut': 'Oversized Boxy' }
  },
  {
    id: 'p10',
    name: 'Urban Sleek Leather Jacket',
    description: 'Crafted from ultra-soft, supple genuine lambskin leather that breaks in beautifully over time. Features symmetrical zipper accents, secure interior travel pockets, and lightweight satin lining for comfortable layering.',
    price: 299.99,
    discount: 10,
    category: 'Fashion',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviews: [],
    brand: 'LeatherCraft',
    specifications: { 'Material': '100% Lambskin Leather', 'Lining': 'Satin Polyester', 'Zipper': 'YKK Symmetrical', 'Style': 'Cafe Racer' }
  },
  {
    id: 'p11',
    name: 'Polarized Aviator Sunglasses',
    description: 'Classic lightweight stainless steel frame aviators detailed with scratch-resistant premium TAC polarized lenses that offer 100% UV400 protection, reducing glare and improving eye comfort on bright days.',
    price: 49.99,
    discount: 30,
    category: 'Fashion',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&auto=format&fit=crop'
    ],
    rating: 4.3,
    reviews: [],
    brand: 'AeroSight',
    specifications: { 'Frame': 'Stainless Steel', 'Lens': 'TAC Polarized', 'Protection': '100% UV400', 'Gender': 'Unisex' }
  },
  {
    id: 'p12',
    name: 'AeroFit Athletic Tee',
    description: 'Breathable, moisture-wicking training shirt knitted with micro-perforated lightweight performance polyester, offering 4-way stretch fabric and flatlock non-chafing seams to maximize training performance.',
    price: 24.99,
    discount: 5,
    category: 'Fashion',
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop'
    ],
    rating: 4.5,
    reviews: [],
    brand: 'Velocity',
    specifications: { 'Material': '92% Polyester, 8% Elastane', 'Fit': 'Athletic Slim', 'Wicking': 'Dry-Fit Tech', 'Reflectivity': 'Yes' }
  },

  // Category: Home & Living
  {
    id: 'p13',
    name: 'Barista Grind Espresso Machine',
    description: 'Precision Italian pump brewing station offering 15-bar powerful pressure extraction, integrated micro-conical steel burr grinder with 15 settings, professional milk steam wand, and computerized pid temperature control.',
    price: 499.99,
    discount: 10,
    category: 'Home & Living',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviews: [
      { id: 'r6', userId: 'u3', userName: 'John Doe', rating: 5, comment: 'Better than commercial coffee shops! The espresso has perfect rich crema and the steam wand whips up microfoam effortlessly.', date: '2026-07-05' }
    ],
    brand: 'BaristaCo',
    specifications: { 'Pressure': '15 Bar Italian Pump', 'Grinder': 'Conical Burr (Stainless)', 'Water Reservoir': '2.0L Removable', 'Heating': 'Thermoblock' }
  },
  {
    id: 'p14',
    name: 'Lumina Smart Desk Lamp',
    description: 'Architectural-grade desk lamp offering multiple custom brightness levels, full RGB hue adjustments, built-in fast 15W wireless charging base, and touch-sensitive slider panel with full smart home assistant voice compatibility.',
    price: 59.99,
    discount: 15,
    category: 'Home & Living',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviews: [],
    brand: 'Lumina',
    specifications: { 'Brightness': '800 Lumens', 'Wireless Charging': '15W Qi-Certified', 'Connectivity': 'WiFi 2.4GHz', 'Color Temp': '2700K - 6500K' }
  },
  {
    id: 'p15',
    name: 'ErgoComfort Office Chair',
    description: 'An ergonomic office chair featuring highly breathable elastic mesh backing, self-adjusting dynamic lumbar tracking, 3D multi-directional adjustable armrests, and 135-degree smooth recline with secure lock controls.',
    price: 279.99,
    discount: 15,
    category: 'Home & Living',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviews: [],
    brand: 'ErgoHome',
    specifications: { 'Frame Material': 'Nylon & Steel', 'Weight Capacity': '150 kg', 'Mesh Type': 'Korean Elastomer', 'Piston': 'Class 4 Gas Lift' }
  },
  {
    id: 'p16',
    name: 'PureAir True HEPA Purifier',
    description: 'H13 medical-grade True HEPA filtration system capturing 99.97% of airborne dust, pollen, pet dander, mold, smoke, and odors. Ideal for bedrooms or home offices, purging spaces up to 500 sq ft within 15 minutes.',
    price: 119.99,
    discount: 20,
    category: 'Home & Living',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviews: [],
    brand: 'PureAir',
    specifications: { 'Filter Grade': 'H13 HEPA', 'CADR': '250 m³/h', 'Coverage': 'Up to 500 sq ft', 'Noise Level': '22dB - 48dB' }
  },
  {
    id: 'p17',
    name: 'Handcrafted Ceramic Mug Set',
    description: 'A set of 4 minimalist, textured stoneware mugs hand-glazed in natural organic earthy neutral tones, each unique and designed with ergonomic wide-loop handles to elevate your morning coffee ritual.',
    price: 34.99,
    discount: 10,
    category: 'Home & Living',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviews: [],
    brand: 'EarthyClay',
    specifications: { 'Quantity': 'Set of 4 Mugs', 'Capacity': '350ml / 12oz', 'Material': 'Stoneware Ceramic', 'Safety': 'Microwave & Dishwasher Safe' }
  },
  {
    id: 'p18',
    name: 'Nordic Soy Scented Candle',
    description: 'Eco-friendly hand-poured natural soy wax candle infused with high-end premium essential oils of Sandalwood, Amber, and Vetiver. Features a wood wick that cracks softly like a real fire, burning for 60 peaceful hours.',
    price: 22.99,
    discount: 0,
    category: 'Home & Living',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop'
    ],
    rating: 4.4,
    reviews: [],
    brand: 'NordicScents',
    specifications: { 'Wax': '100% Organic Soy Wax', 'Wick': 'Natural Maple Wood Wick', 'Burn Time': '60 Hours', 'Weight': '8.5 oz / 240g' }
  },

  // Category: Fitness & Wellness
  {
    id: 'p19',
    name: 'ZenFlex Non-Slip Yoga Mat',
    description: 'Eco-friendly TPE foam formulation offering dense joint cushioning, customized laser-etched anatomical alignment lines, dual-sided non-slip grip, and lightweight travel carry strap.',
    price: 45.00,
    discount: 10,
    category: 'Fitness & Wellness',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviews: [],
    brand: 'ZenFlex',
    specifications: { 'Material': 'Eco TPE (Latex Free)', 'Dimensions': '183cm x 61cm', 'Thickness': '6mm', 'Weight': '900g' }
  },
  {
    id: 'p20',
    name: 'Smart Hydrate Water Bottle',
    description: 'Double-walled insulated stainless steel bottle with a built-in UV-C sterilization cap that purifies drinking water and neutralizes bacteria every 2 hours, keeping beverages ice cold for 24 hours or hot for 12 hours.',
    price: 65.00,
    discount: 15,
    category: 'Fitness & Wellness',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594541785566-f49c565da2c0?w=600&auto=format&fit=crop'
    ],
    rating: 4.5,
    reviews: [],
    brand: 'PureFlow',
    specifications: { 'Capacity': '600ml / 20oz', 'Material': '18/8 Food-Grade Stainless Steel', 'Sterilization': 'UV-C LED', 'Charge': 'Magnetic USB (lasts 1 month)' }
  },
  {
    id: 'p21',
    name: 'DeepPulse Massage Gun',
    description: 'Professional-grade percussion therapy massager powered by a whisper-quiet high-torque brushless motor. Delivers up to 3200 percussions per minute, featuring 30 speed levels and 6 customized interchangeable massage heads.',
    price: 119.99,
    discount: 25,
    category: 'Fitness & Wellness',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1614913759325-a131b78ee294?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviews: [],
    brand: 'DeepPulse',
    specifications: { 'Motor': '24V Brushless (Max 3200 RPM)', 'Speeds': '30 Variable Settings', 'Battery': 'Rechargeable Lithium (6 Hours)', 'Noise': 'Less than 45dB' }
  },
  {
    id: 'p22',
    name: 'IronCore Select Bell Dumbbells',
    description: 'Heavy-duty space-saving selector dumbbells adjustable from 5 lbs up to 52.5 lbs with a simple smooth rotating dial. Coated in durable thermo-plastic rubber to prevent scraping noise and floor damage.',
    price: 249.99,
    discount: 10,
    category: 'Fitness & Wellness',
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviews: [],
    brand: 'IronCore',
    specifications: { 'Weight Range': '5 to 52.5 lbs (2.3 to 24 kg)', 'Settings': '15 Increment Adjustments', 'Material': 'Powder-coated Steel', 'Tray': 'Included' }
  },
  {
    id: 'p23',
    name: 'AuraMist Essential Oil Diffuser',
    description: 'Whisper-quiet ultrasonic oil diffuser designed with a striking real solid wood casing and hand-glazed ceramic top. Features warm ambient glow candle-light LEDs, continuous or intermittent misting, and auto shut-off.',
    price: 39.99,
    discount: 15,
    category: 'Fitness & Wellness',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviews: [],
    brand: 'AuraMist',
    specifications: { 'Capacity': '200ml', 'Material': 'Solid Oak & Ceramic', 'Runtime': '8 Hours Intermittent', 'LED Colors': '7 Warm Shades' }
  },

  // Category: Accessories
  {
    id: 'p24',
    name: 'Minimalist Carbon Cardholder',
    description: 'Sleek, pocket-friendly minimalist wallet constructed from aerospace-grade rigid carbon fiber weave and aluminum core, holding up to 12 cards with integrated spring RFID blocking and stainless steel cash strap.',
    price: 49.99,
    discount: 20,
    category: 'Accessories',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1627124118123-275197004cc4?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588444839799-eb6cd27e3e26?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598343175492-9e7dc0e63cc6?w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviews: [],
    brand: 'CarbonGear',
    specifications: { 'Material': 'Carbon Fiber & Aerospace Aluminum', 'Capacity': '1 - 12 Cards', 'RFID Blocking': 'Yes, Certified', 'Weight': '55g' }
  },
  {
    id: 'p25',
    name: 'Voyager Leather Travel Backpack',
    description: 'Premium full-grain heritage leather backpack designed with structured laptop sleeve for up to 16 inches, expandable main packing capacity, quick-access passport slots, and ventilated ergonomic mesh shoulder padding.',
    price: 189.99,
    discount: 10,
    category: 'Accessories',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviews: [],
    brand: 'Voyager',
    specifications: { 'Material': 'Full-Grain Cowhide Leather', 'Laptop Sleeve': 'Up to 16 inch Mac/PC', 'Capacity': '25 Liters', 'Dimensions': '45cm x 30cm x 15cm' }
  },
  {
    id: 'p26',
    name: 'Metro Canvas Duffel Bag',
    description: 'Crafted from high-density, water-resistant waxed cotton canvas and details of genuine oil-tanned leather. Perfect weekend escape travel bag designed with separate wet/dry shoes compartment.',
    price: 79.99,
    discount: 15,
    category: 'Accessories',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524498250077-3a058b35480d?w=600&auto=format&fit=crop'
    ],
    rating: 4.5,
    reviews: [],
    brand: 'Voyager',
    specifications: { 'Material': 'Waxed Canvas & Crazy Horse Leather', 'Capacity': '40 Liters', 'Compartments': 'Shoe pocket + 5 interior pockets', 'Strap': 'Removable adjustable cotton web shoulder strap' }
  },
  {
    id: 'p27',
    name: 'Sleek Protection Laptop Sleeve',
    description: 'Minimalist water-repellent felt sleeve lined with heavy-density cushion padding, integrated auxiliary magnetic closure, and back pockets designed for power chargers, notebooks, and tablet styluses.',
    price: 29.99,
    discount: 10,
    category: 'Accessories',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1541140111813-8222e9d90981?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop'
    ],
    rating: 4.4,
    reviews: [],
    brand: 'MinimalLabel',
    specifications: { 'Material': 'Eco-Friendly Merino Wool Felt', 'Fit': 'MacBook Pro/Air 13-14 inch', 'Locking': 'Invisible Magnet Flap', 'Lining': 'Scratch-free Microfiber' }
  },
  {
    id: 'p28',
    name: 'StormBreaker Travel Umbrella',
    description: 'Ultra-durable travel umbrella constructed with high-flex 9-rib fiberglass frame, Teflon double-canopy waterproof weave, comfortable ergonomic slip-resistant rubber handle, and automatic fast open/close action button.',
    price: 24.99,
    discount: 20,
    category: 'Accessories',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop'
    ],
    rating: 4.5,
    reviews: [],
    brand: 'AeroSight',
    specifications: { 'Canopy Weave': '210T Dupont Teflon Polyester', 'Rib Count': '9 High-Tensile Fiberglass Ribs', 'Windproof Rating': 'Up to 60 MPH gusts', 'Folding Length': '12 inches' }
  },

  // Category: Beauty & Wellness (Extra products to cross 30 easily!)
  {
    id: 'p29',
    name: 'Organic Glow Skincare Kit',
    description: 'A 3-step plant-powered organic daily skincare regimen designed to purify, tone, and lock in deep cellular moisture. Includes Gentle Hydrating Cleanser, Rosewater Refresh Toner, and Vitamin C Brightening Serum.',
    price: 49.00,
    discount: 15,
    category: 'Beauty & Wellness',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviews: [],
    brand: 'OrganicGlow',
    specifications: { 'Cleanser': '150ml Hydrating Oat Cleanser', 'Toner': '100ml Pure Rosewater Mist', 'Serum': '30ml Vitamin C Elixir', 'Skin Type': 'All Skin Types (Sensitive Approved)' }
  },
  {
    id: 'p30',
    name: 'AeroSalon Professional Hair Dryer',
    description: 'An advanced salon-grade ionic hair dryer utilizing a robust 1875W AC motor. Features smart continuous ceramic tourmaline heat distribution, dual speed, three custom temperature click switches, and styling concentrator nozzles.',
    price: 89.99,
    discount: 10,
    category: 'Beauty & Wellness',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviews: [],
    brand: 'AeroSound',
    specifications: { 'Motor Power': '1875 Watts AC', 'Tech': 'Negative Ion Conditioning', 'Speeds/Heats': '2 Speed / 3 Temperature levels', 'Cord Length': '2.7m Salon Cord' }
  },
  {
    id: 'p31',
    name: 'Jade Facial Massage roller',
    description: 'Authentic 100% natural Grade-A green jade stone roller and Gua Sha scraping tool designed to improve facial circulation, drain lymphatic fluid, soothe muscle puffiness, and smooth fine lines.',
    price: 19.99,
    discount: 5,
    category: 'Beauty & Wellness',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop'
    ],
    rating: 4.4,
    reviews: [],
    brand: 'OrganicGlow',
    specifications: { 'Stone': '100% Certified Brazilian Jade', 'Tools': 'Dual-Sided Roller + Gua Sha Scraper', 'Fittings': 'Noise-Free Silicon Cap Insertures', 'Storage': 'Magnetic luxury box' }
  }
];

// Helper to load/save JSON DB
function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading database file, resetting...', e);
    }
  }

  // Create initial DB structure
  const hashedPassword = bcrypt.hashSync('user123', 10);
  const adminHashed = bcrypt.hashSync('admin123', 10);

  const initialUsers: User[] = [
    {
      id: 'u1',
      name: 'Alex Customer',
      email: 'user@gmail.com',
      phone: '9876543210',
      address: '456 Shoppers Avenue, Retail City, NY 10001',
      savedAddresses: ['456 Shoppers Avenue, Retail City, NY 10001', '789 Office Tower, Tech Hub, NY 10002'],
      role: 'user',
      createdDate: '2026-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      name: 'System Administrator',
      email: 'admin@gmail.com',
      phone: '1234567890',
      address: '123 Admin Lane, Cloud District, CA 94016',
      savedAddresses: ['123 Admin Lane, Cloud District, CA 94016'],
      role: 'admin',
      createdDate: '2026-01-01T00:00:00Z',
    }
  ];

  const db = {
    users: initialUsers,
    passwords: {
      'u1': hashedPassword,
      'u2': adminHashed
    },
    products: initialProducts,
    orders: [] as Order[],
    coupons: initialCoupons,
    carts: {} as { [userId: string]: { productId: string; quantity: number }[] },
    wishlists: {} as { [userId: string]: string[] }
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  return db;
}

function saveDatabase(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
}

// Admin Auth Middleware
function requireAdmin(req: any, res: any, next: any) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
}

// API Routes

// 1. Authentication APIs
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const db = loadDatabase();
  const existingUser = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  const userId = 'u_' + Math.random().toString(36).substr(2, 9);
  const newUser: User = {
    id: userId,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    address: address || '',
    savedAddresses: address ? [address] : [],
    role: 'user',
    createdDate: new Date().toISOString()
  };

  db.users.push(newUser);
  db.passwords[userId] = bcrypt.hashSync(password, 10);
  saveDatabase(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user: newUser, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const db = loadDatabase();
  const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  const hash = db.passwords[user.id];
  if (!hash || !bcrypt.compareSync(password, hash)) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

app.get('/api/auth/profile', authenticateToken, (req: any, res) => {
  const db = loadDatabase();
  const user = db.users.find((u: User) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json(user);
});

app.put('/api/auth/profile', authenticateToken, (req: any, res) => {
  const { name, phone, address, savedAddresses } = req.body;
  const db = loadDatabase();
  const userIndex = db.users.findIndex((u: User) => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const updatedUser = {
    ...db.users[userIndex],
    name: name || db.users[userIndex].name,
    phone: phone !== undefined ? phone : db.users[userIndex].phone,
    address: address !== undefined ? address : db.users[userIndex].address,
    savedAddresses: savedAddresses !== undefined ? savedAddresses : db.users[userIndex].savedAddresses
  };

  db.users[userIndex] = updatedUser;
  saveDatabase(db);
  res.json(updatedUser);
});

app.put('/api/auth/change-password', authenticateToken, (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }

  const db = loadDatabase();
  const hash = db.passwords[req.user.id];

  if (!hash || !bcrypt.compareSync(currentPassword, hash)) {
    return res.status(400).json({ message: 'Incorrect current password.' });
  }

  db.passwords[req.user.id] = bcrypt.hashSync(newPassword, 10);
  saveDatabase(db);
  res.json({ message: 'Password changed successfully.' });
});

app.post('/api/auth/delete-account', authenticateToken, (req: any, res) => {
  const db = loadDatabase();
  db.users = db.users.filter((u: User) => u.id !== req.user.id);
  delete db.passwords[req.user.id];
  if (db.carts[req.user.id]) delete db.carts[req.user.id];
  if (db.wishlists[req.user.id]) delete db.wishlists[req.user.id];
  saveDatabase(db);
  res.json({ message: 'Account deleted successfully.' });
});


// 2. Product APIs
app.get('/api/products', (req, res) => {
  const db = loadDatabase();
  let products = [...db.products];

  const { search, category, brand, rating, minPrice, maxPrice, sort, page, limit, availableOnly } = req.query;

  // Filtering
  if (search) {
    const q = (search as string).toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (brand) {
    products = products.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  if (rating) {
    const r = parseFloat(rating as string);
    products = products.filter(p => p.rating >= r);
  }

  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice as string));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice as string));
  }

  if (availableOnly === 'true') {
    products = products.filter(p => p.stock > 0);
  }

  // Sorting
  if (sort) {
    switch (sort as string) {
      case 'newest':
        // Seed order is fine
        break;
      case 'price_asc':
        products.sort((a, b) => (a.price * (1 - a.discount/100)) - (b.price * (1 - b.discount/100)));
        break;
      case 'price_desc':
        products.sort((a, b) => (b.price * (1 - b.discount/100)) - (a.price * (1 - a.discount/100)));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        products.sort((a, b) => (b.reviews.length || 0) - (a.reviews.length || 0));
        break;
    }
  }

  // Pagination
  const p = parseInt(page as string) || 1;
  const l = parseInt(limit as string) || 12;
  const total = products.length;
  const startIndex = (p - 1) * l;
  const paginatedProducts = products.slice(startIndex, startIndex + l);

  res.json({
    products: paginatedProducts,
    total,
    page: p,
    totalPages: Math.ceil(total / l)
  });
});

app.get('/api/products/suggestions', (req, res) => {
  const db = loadDatabase();
  const q = ((req.query.search || '') as string).toLowerCase();

  if (!q) {
    return res.json({ suggestions: [] });
  }

  const matches = new Set<string>();
  db.products.forEach((p: Product) => {
    if (p.name.toLowerCase().includes(q)) {
      matches.add(p.name);
    }
    if (p.brand.toLowerCase().includes(q)) {
      matches.add(p.brand);
    }
    if (p.category.toLowerCase().includes(q)) {
      matches.add(p.category);
    }
  });

  res.json({ suggestions: Array.from(matches).slice(0, 10) });
});

app.get('/api/products/:id', (req, res) => {
  const db = loadDatabase();
  const product = db.products.find((p: Product) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  // Find related products in same category
  const related = db.products
    .filter((p: Product) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  res.json({ product, related });
});

app.post('/api/products/:id/reviews', authenticateToken, (req: any, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required.' });
  }

  const db = loadDatabase();
  const productIndex = db.products.findIndex((p: Product) => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const product = db.products[productIndex];
  const newReview: Review = {
    id: 'r_' + Math.random().toString(36).substr(2, 9),
    userId: req.user.id,
    userName: req.user.name,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  product.reviews.push(newReview);

  // Recalculate rating
  const sum = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
  product.rating = Number((sum / product.reviews.length).toFixed(1));

  db.products[productIndex] = product;
  saveDatabase(db);

  res.status(201).json({ review: newReview, rating: product.rating, reviewsCount: product.reviews.length });
});


// 3. Cart APIs
app.get('/api/cart', authenticateToken, (req: any, res) => {
  const db = loadDatabase();
  const userCart = db.carts[req.user.id] || [];

  // Map product objects
  const cartWithProducts = userCart.map((item: any) => {
    const product = db.products.find((p: Product) => p.id === item.productId);
    return {
      product,
      quantity: item.quantity
    };
  }).filter((item: any) => item.product !== undefined);

  res.json(cartWithProducts);
});

app.post('/api/cart', authenticateToken, (req: any, res) => {
  const { items } = req.body; // Array of { productId, quantity }

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Cart items must be an array.' });
  }

  const db = loadDatabase();
  db.carts[req.user.id] = items.map(item => ({
    productId: item.productId,
    quantity: Math.max(1, item.quantity)
  }));

  saveDatabase(db);
  res.json({ message: 'Cart synced successfully.' });
});


// 4. Wishlist APIs
app.get('/api/wishlist', authenticateToken, (req: any, res) => {
  const db = loadDatabase();
  const userWishlist = db.wishlists[req.user.id] || [];

  const wishlistProducts = userWishlist.map((id: string) => {
    return db.products.find((p: Product) => p.id === id);
  }).filter((p: any) => p !== undefined);

  res.json(wishlistProducts);
});

app.post('/api/wishlist', authenticateToken, (req: any, res) => {
  const { productIds } = req.body; // Array of product ids

  if (!Array.isArray(productIds)) {
    return res.status(400).json({ message: 'Wishlist must be an array of product IDs.' });
  }

  const db = loadDatabase();
  db.wishlists[req.user.id] = productIds;
  saveDatabase(db);

  res.json({ message: 'Wishlist synced successfully.' });
});


// 5. Coupon API
app.get('/api/coupons/validate', (req, res) => {
  const { code, amount } = req.query;
  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required.' });
  }

  const db = loadDatabase();
  const coupon = db.coupons.find((c: Coupon) => c.code.toUpperCase() === (code as string).toUpperCase());

  if (!coupon) {
    return res.status(404).json({ message: 'Invalid coupon code.' });
  }

  const spend = parseFloat(amount as string) || 0;
  if (spend < coupon.minSpend) {
    return res.status(400).json({ message: `Minimum spend of ₹${coupon.minSpend} required to use coupon ${coupon.code}.` });
  }

  res.json(coupon);
});

app.get('/api/coupons', (req, res) => {
  const db = loadDatabase();
  res.json(db.coupons);
});


// 6. Order APIs
app.post('/api/orders', authenticateToken, (req: any, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, couponCode, cardDetails, upiId } = req.body;

  if (!items || !items.length || !shippingAddress || !billingAddress || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required order fields.' });
  }

  const db = loadDatabase();

  // Validate Stock and fetch products
  const orderItems: any[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = db.products.find((p: Product) => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product ${item.productId} not found.` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for product "${product.name}". Available: ${product.stock}` });
    }

    const itemPrice = product.price;
    const finalPrice = Number((itemPrice * (1 - product.discount/100)).toFixed(2));

    subtotal += finalPrice * item.quantity;

    orderItems.push({
      id: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      discount: product.discount,
      quantity: item.quantity
    });
  }

  // Calculate discounts & coupon
  let discountAmount = 0;
  if (couponCode) {
    const coupon = db.coupons.find((c: Coupon) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon && subtotal >= coupon.minSpend) {
      discountAmount = Number((subtotal * (coupon.discountPercent / 100)).toFixed(2));
    }
  }

  const remaining = subtotal - discountAmount;
  const gstAmount = Number((remaining * 0.18).toFixed(2)); // GST 18%
  const shippingCost = remaining > 4999 ? 0 : 149; // Free shipping over ₹4999
  const totalAmount = Number((remaining + gstAmount + shippingCost).toFixed(2));

  // Subtract stock from db
  for (const item of items) {
    const productIndex = db.products.findIndex((p: Product) => p.id === item.productId);
    db.products[productIndex].stock -= item.quantity;
  }

  // Payment Status Mock
  let paymentStatus: 'Pending' | 'Paid' | 'Failed' = 'Pending';
  if (paymentMethod === 'CreditCard') {
    // Basic verification of mock details
    if (!cardDetails || !cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      return res.status(400).json({ message: 'Invalid card details provided.' });
    }
    paymentStatus = 'Paid';
  } else if (paymentMethod === 'UPI') {
    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ message: 'Invalid UPI Address.' });
    }
    paymentStatus = 'Paid';
  } else if (paymentMethod === 'COD') {
    paymentStatus = 'Pending';
  }

  const orderId = 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const newOrder: Order = {
    id: orderId,
    userId: req.user.id,
    items: orderItems,
    shippingAddress,
    billingAddress,
    paymentMethod,
    paymentStatus,
    orderStatus: 'Pending',
    orderDate: new Date().toISOString(),
    totalAmount,
    couponCode,
    discountAmount,
    gstAmount,
    shippingCost
  };

  db.orders.unshift(newOrder); // Add to beginning of history
  db.carts[req.user.id] = []; // Clear user's cart
  saveDatabase(db);

  res.status(201).json({ order: newOrder, message: 'Order placed successfully!' });
});

app.get('/api/orders', authenticateToken, (req: any, res) => {
  const db = loadDatabase();
  if (req.user.role === 'admin') {
    return res.json(db.orders);
  }
  const userOrders = db.orders.filter((o: Order) => o.userId === req.user.id);
  res.json(userOrders);
});

app.put('/api/orders/:id/status', authenticateToken, requireAdmin, (req: any, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  const db = loadDatabase();
  const orderIndex = db.orders.findIndex((o: Order) => o.id === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  db.orders[orderIndex].orderStatus = status;

  if (status === 'Delivered') {
    db.orders[orderIndex].paymentStatus = 'Paid';
  }

  saveDatabase(db);
  res.json(db.orders[orderIndex]);
});

app.put('/api/orders/:id/cancel', authenticateToken, (req: any, res) => {
  const db = loadDatabase();
  const orderIndex = db.orders.findIndex((o: Order) => o.id === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  const order = db.orders[orderIndex];

  // Users can only cancel their own orders, and only if they are Pending
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized.' });
  }

  if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Processing' && req.user.role !== 'admin') {
    return res.status(400).json({ message: 'This order is already shipped and cannot be cancelled.' });
  }

  order.orderStatus = 'Cancelled';

  // Restore product stock
  for (const item of order.items) {
    const productIndex = db.products.findIndex((p: Product) => p.id === item.id);
    if (productIndex !== -1) {
      db.products[productIndex].stock += item.quantity;
    }
  }

  db.orders[orderIndex] = order;
  saveDatabase(db);

  res.json({ order, message: 'Order cancelled successfully.' });
});


// 7. Admin Dashboard & Product CRUD
app.get('/api/admin/analytics', authenticateToken, requireAdmin, (req: any, res) => {
  const db = loadDatabase();
  const orders: Order[] = db.orders;
  const products: Product[] = db.products;
  const users: User[] = db.users;

  // Key metrics
  const totalUsers = users.length;
  const totalProducts = products.length;
  const completedOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Generate sales over time (last 7 days)
  const salesHistory: SalesStat[] = [];
  const days = 7;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOrders = orders.filter(o => o.orderDate.startsWith(dateStr) && o.orderStatus !== 'Cancelled');
    const dayRevenue = dayOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    salesHistory.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      revenue: Number(dayRevenue.toFixed(2)),
      ordersCount: dayOrders.length
    });
  }

  // Category sales share
  const categorySalesMap: { [cat: string]: number } = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      // Find category from product index
      const prod = db.products.find((p: Product) => p.id === item.id);
      const cat = prod ? prod.category : 'Other';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * (1 - item.discount / 100) * item.quantity);
    });
  });

  const categoryShare: CategoryShare[] = Object.keys(categorySalesMap).map(cat => ({
    name: cat,
    value: Number(categorySalesMap[cat].toFixed(2))
  }));

  // Low stock products alert (stock <= 15)
  const stockAlerts = products.filter(p => p.stock <= 15).map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    category: p.category
  }));

  // Top selling products
  const productSalesMap: { [id: string]: { name: string; quantity: number; revenue: number; image: string } } = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productSalesMap[item.id]) {
        productSalesMap[item.id] = { name: item.name, quantity: 0, revenue: 0, image: item.image };
      }
      productSalesMap[item.id].quantity += item.quantity;
      productSalesMap[item.id].revenue += (item.price * (1 - item.discount / 100) * item.quantity);
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  res.json({
    metrics: {
      totalUsers,
      totalProducts,
      totalOrders: orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2))
    },
    salesHistory,
    categoryShare,
    stockAlerts,
    topProducts,
    recentOrders: orders.slice(0, 5)
  });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const db = loadDatabase();
  // Don't expose passwords
  const safeUsers = db.users.map((u: User) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    address: u.address,
    savedAddresses: u.savedAddresses,
    role: u.role,
    createdDate: u.createdDate
  }));
  res.json(safeUsers);
});

app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (role !== 'user' && role !== 'admin') {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  const db = loadDatabase();
  const userIndex = db.users.findIndex((u: User) => u.id === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  db.users[userIndex].role = role;
  saveDatabase(db);

  res.json(db.users[userIndex]);
});

app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, discount, category, stock, images, brand, specifications } = req.body;

  if (!name || !description || !price || !category || !stock || !brand) {
    return res.status(400).json({ message: 'Missing required product fields.' });
  }

  const db = loadDatabase();
  const productImages = images && images.length ? images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'
  ];

  const newProduct: Product = {
    id: 'p' + (db.products.length + 1) + '_' + Math.random().toString(36).substr(2, 4),
    name,
    description,
    price: Number(price),
    discount: Number(discount) || 0,
    category,
    stock: Number(stock),
    images: productImages,
    rating: 5.0,
    reviews: [],
    brand,
    specifications: specifications || {}
  };

  db.products.unshift(newProduct); // Add to beginning of catalog
  saveDatabase(db);

  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, discount, category, stock, images, brand, specifications } = req.body;
  const db = loadDatabase();
  const index = db.products.findIndex((p: Product) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const updatedProduct = {
    ...db.products[index],
    name: name || db.products[index].name,
    description: description || db.products[index].description,
    price: price !== undefined ? Number(price) : db.products[index].price,
    discount: discount !== undefined ? Number(discount) : db.products[index].discount,
    category: category || db.products[index].category,
    stock: stock !== undefined ? Number(stock) : db.products[index].stock,
    images: images && images.length ? images : db.products[index].images,
    brand: brand || db.products[index].brand,
    specifications: specifications !== undefined ? specifications : db.products[index].specifications
  };

  db.products[index] = updatedProduct;
  saveDatabase(db);

  res.json(updatedProduct);
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = loadDatabase();
  const initialCount = db.products.length;
  db.products = db.products.filter((p: Product) => p.id !== req.params.id);

  if (db.products.length === initialCount) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  saveDatabase(db);
  res.json({ message: 'Product deleted successfully.' });
});


// Serve static assets / handle Vite in Dev vs Production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();

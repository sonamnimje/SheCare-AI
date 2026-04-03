import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCartShopping, FaMinus, FaPlus, FaRegHeart, FaShieldHeart, FaHeadset, FaTruck } from "react-icons/fa6";
import heroArtwork from "../pht/She (1).png";
import sanitaryPadsImage from "../pht/sanitarypads.png";
import tamponImage from "../pht/tampon.jpeg";
import menstrualCupsImage from "../pht/menstrualcups.jpeg";
import heatingPadsImage from "../pht/heatingpads.jpeg";
import herbalTeaImage from "../pht/herbaltea.jpeg";
import periodPantyImage from "../pht/periodpanty.jpeg";
import "./Shop.css";

const CATEGORIES = ["All", "Pads", "Tampons", "Menstrual Cups", "Wellness"];

const PRODUCTS = [
  {
    id: 1,
    name: "Organic Cotton Pads",
    category: "Pads",
    description: "100% natural & hypoallergenic",
    price: 249,
    image: sanitaryPadsImage,
    accent: "#f6a8c5",
    accentSoft: "#fff2f7"
  },
  {
    id: 2,
    name: "Tampon Set",
    category: "Tampons",
    description: "Super & regular tampons",
    price: 299,
    image: tamponImage,
    accent: "#e8b06f",
    accentSoft: "#fff5ea"
  },
  {
    id: 3,
    name: "Menstrual Cup",
    category: "Menstrual Cups",
    description: "Reusable & eco-friendly",
    price: 349,
    image: menstrualCupsImage,
    accent: "#9c69d6",
    accentSoft: "#f7efff"
  },
  {
    id: 4,
    name: "Heating Pad",
    category: "Wellness",
    description: "Pain relief for cramps",
    price: 499,
    image: heatingPadsImage,
    accent: "#ff8db1",
    accentSoft: "#fff0f5"
  },
  {
    id: 5,
    name: "Herbal Tea for PMS",
    category: "Wellness",
    description: "Calming herbal blend",
    price: 199,
    image: herbalTeaImage,
    accent: "#c8a36a",
    accentSoft: "#fff8ed"
  },
  {
    id: 6,
    name: "Period Panties",
    category: "Wellness",
    description: "Leak-proof & comfortable",
    price: 399,
    image: periodPantyImage,
    accent: "#3b3b44",
    accentSoft: "#f4f5f8"
  }
];

const CART_STORAGE_KEY = "shecare_shop_cart";

const formatPrice = (value) => `₹ ${value}`;

const readStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
};

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return PRODUCTS;
    }

    return PRODUCTS.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const cartEntries = useMemo(() => {
    return PRODUCTS.map((product) => ({
      ...product,
      quantity: cart[product.id] || 0
    })).filter((product) => product.quantity > 0);
  }, [cart]);

  const cartCount = cartEntries.reduce((total, product) => total + product.quantity, 0);
  const cartTotal = cartEntries.reduce((total, product) => total + product.quantity * product.price, 0);

  const addToCart = (productId) => {
    setCart((current) => ({
      ...current,
      [productId]: (current[productId] || 0) + 1
    }));
  };

  const decrementItem = (productId) => {
    setCart((current) => {
      const quantity = current[productId] || 0;

      if (quantity <= 1) {
        const next = { ...current };
        delete next[productId];
        return next;
      }

      return {
        ...current,
        [productId]: quantity - 1
      };
    });
  };

  const scrollToCart = () => {
    const cartSection = document.getElementById("cart-summary");

    if (cartSection) {
      cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-shell">
        <header className="shop-topbar">
          <Link to="/" className="shop-brand" aria-label="SheCare AI home">
            <img src={heroArtwork} alt="SheCare AI" className="shop-brand-mark" />
            <div>
              <div className="shop-brand-name">SheCare AI</div>
              <div className="shop-brand-tag">Period care essentials</div>
            </div>
          </Link>

          <nav className="shop-nav" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/recommendations">Recommendations</Link>
            <Link to="/shop" className="active">Shop</Link>
            <button type="button" onClick={scrollToCart} className="shop-nav-button">
              My Cart <span className="shop-badge">{cartCount}</span>
            </button>
          </nav>
        </header>

        <section className="shop-hero">
          <div className="shop-hero-copy">
            <p className="shop-kicker">Curated self-care essentials</p>
            <h1>Period Care Essentials</h1>
            <p className="shop-subtitle">Your Wellness, Your Comfort.</p>
            <p className="shop-description">
              Thoughtful, comfort-first products for every cycle day. Choose the essentials that fit your routine and build a cart that feels practical, calming, and easy to manage.
            </p>

            <div className="shop-hero-actions">
              <button type="button" className="shop-primary-action" onClick={() => setActiveCategory("All")}>Shop All</button>
              <button type="button" className="shop-secondary-action" onClick={scrollToCart}>View Cart</button>
            </div>

            <div className="shop-metrics">
              <div>
                <strong>6</strong>
                <span>wellness picks</span>
              </div>
              <div>
                <strong>₹500+</strong>
                <span>free shipping</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>support</span>
              </div>
            </div>
          </div>

          <div className="shop-hero-art">
            <div className="shop-hero-orb shop-hero-orb-one" />
            <div className="shop-hero-orb shop-hero-orb-two" />
            <img src={heroArtwork} alt="SheCare period care illustration" className="shop-hero-image" />
          </div>
        </section>

        <section className="shop-controls">
          <div className="shop-tabs" role="tablist" aria-label="Product categories">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={`shop-tab ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <button type="button" className="shop-cart-chip" onClick={scrollToCart}>
            <FaCartShopping />
            Cart ({cartCount})
          </button>
        </section>

        <section className="shop-grid" aria-label="Products">
          {filteredProducts.map((product, index) => {
            const quantity = cart[product.id] || 0;

            return (
              <motion.article
                key={product.id}
                className="shop-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                style={{
                  "--accent": product.accent,
                  "--accent-soft": product.accentSoft
                }}
              >
                <div className="shop-card-visual" aria-hidden="true">
                  <div className="shop-card-glow" />
                  <img src={product.image} alt={product.name} className="shop-card-image" />
                  <div className="shop-card-note">{product.note}</div>
                </div>
                <div className="shop-card-copy">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
                <div className="shop-card-footer">
                  <div className="shop-card-price">{formatPrice(product.price)}</div>
                  <button type="button" className="shop-add-button" onClick={() => addToCart(product.id)}>
                    <FaCartShopping />
                    {quantity > 0 ? `Add Another (${quantity})` : "Add to Cart"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </section>

        <section className="shop-cart-summary" id="cart-summary">
          <div className="shop-cart-header">
            <div>
              <p className="shop-kicker">Cart summary</p>
              <h2>Your Cart ({cartCount})</h2>
            </div>
            <div className="shop-cart-total">{formatPrice(cartTotal)}</div>
          </div>

          {cartEntries.length === 0 ? (
            <div className="shop-empty-cart">
              <FaRegHeart />
              <p>Your cart is empty. Add a few essentials to get started.</p>
            </div>
          ) : (
            <div className="shop-cart-items">
              {cartEntries.map((item) => (
                <div key={item.id} className="shop-cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} x {formatPrice(item.price)}</span>
                  </div>
                  <div className="shop-cart-actions">
                    <button type="button" onClick={() => decrementItem(item.id)} aria-label={`Remove one ${item.name}`}>
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => addToCart(item.id)} aria-label={`Add one more ${item.name}`}>
                      <FaPlus />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="shop-trust-bar" aria-label="Service highlights">
          <div className="shop-trust-item">
            <FaTruck />
            <span>Free Shipping on Orders over ₹500</span>
          </div>
          <div className="shop-trust-divider" />
          <div className="shop-trust-item">
            <FaHeadset />
            <span>24/7 Customer Support</span>
          </div>
          <div className="shop-trust-divider" />
          <div className="shop-trust-item">
            <FaShieldHeart />
            <span>Secure Payment Options</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Shop;

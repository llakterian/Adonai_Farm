import React from 'react';

// Data that would typically come from a CMS or API
const farmInfo = {
    name: "Adonai Farm",
    tagline: "Sustainable Farming, Superior Quality",
    logoUrl: "/images/logo.png", // Assuming a logo file exists
    address: "Chepsir, Kericho, Kenya",
    phone: "+254 722 759 217",
    email: "info@adonaifarm.co.ke",
    mission: "To provide high-quality livestock and agricultural products while pioneering sustainable farming practices.",
    vision: "To be the leading example of technology-enhanced sustainable farming in East Africa."
};

const products = [
    {
        name: "Grass-Fed Beef",
        description: "Premium Angus beef from our pasture-raised cattle, known for its rich flavor and tenderness.",
        icon: "🐄"
    },
    {
        name: "Premium Dairy Products",
        description: "Fresh milk, artisanal cheese, and yogurt from our healthy, happy Holstein and Jersey cows.",
        icon: "🥛"
    },
    {
        name: "Farm Fresh Eggs",
        description: "Nutritious free-range eggs from our Rhode Island Red and Leghorn chickens.",
        icon: "🥚"
    },
    {
        name: "High-Quality Wool",
        description: "Soft, durable wool from our well-cared-for Romney and Merino sheep, perfect for textiles.",
        icon: "🐑"
    },
    {
        name: "Breeding Livestock",
        description: "Genetically superior livestock for breeding, including cattle, goats, and sheep with champion bloodlines.",
        icon: "🏆"
    }
];

const services = [
    {
        name: "Agricultural Consulting",
        description: "Expert advice on sustainable farming, livestock management, and technology integration.",
        icon: "📈"
    },
    {
        name: "Farm Visits & Tours",
        description: "Educational and immersive tours for all ages to experience modern, sustainable farming firsthand.",
        icon: "🌾"
    }
];

const Brochure = () => {
    const handlePrint = () => {
        const printButton = document.getElementById('print-button');
        const brochureTitle = document.getElementById('brochure-title');

        // Hide elements not needed for printing
        if (printButton) printButton.style.display = 'none';
        if (brochureTitle) brochureTitle.style.display = 'none';

        window.print();

        // Show elements again after printing
        if (printButton) printButton.style.display = 'block';
        if (brochureTitle) brochureTitle.style.display = 'block';
    };

    return (
        <>
            <h1 id="brochure-title" style={styles.title}>Farm Brochure</h1>
            <div style={styles.brochureContainer}>
                {/* Header Section */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.farmName}>{farmInfo.name}</h1>
                        <p style={styles.tagline}>{farmInfo.tagline}</p>
                    </div>
                </header>

                {/* Main Content */}
                <main style={styles.main}>
                    {/* About Section */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Our Mission & Vision</h2>
                        <p><strong>Mission:</strong> {farmInfo.mission}</p>
                        <p><strong>Vision:</strong> {farmInfo.vision}</p>
                    </section>

                    {/* Products Section */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Our Premium Products</h2>
                        <div style={styles.grid}>
                            {products.map(
                                // ...rest of your code...
                            )}
                        </div>
                    </section>
                    {/* Add other sections as needed */}
                </main>
            </div>
        </>
        );
    
    };
    
    export default Brochure;

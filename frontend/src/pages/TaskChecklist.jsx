import React, { useState, useEffect } from 'react';

const TASKS = [
    {
        section: "Remove/Hide All Prices",
        items: [
            "Search all files for price-related fields, variables, or UI elements (price, cost, ₦, $, etc.)",
            "Remove or comment out any code that displays or references prices",
            "Update product descriptions to say \"Contact us for pricing\" where appropriate",
            "Test all pages (products, listings, admin, etc.) to confirm no prices are visible"
        ]
    },
    {
        section: "Draft & Design a Beautiful Brochure (Agricultural Theme)",
        items: [
            "List all farm products (dairy, beef, goats, sheep, poultry, eggs, wool, etc.)",
            "Write engaging, concise descriptions for each product",
            "Select and assign high-quality images from /public/images for each product",
            "Design a visually appealing, agriculturally themed brochure layout (A4/trifold/digital)",
            "Add farm branding: logo, contact info, address, and a \"Contact us for pricing\" call-to-action",
            "Export the brochure as a PDF",
            "Create a web page version of the brochure, fully responsive"
        ]
    },
    {
        section: "Create a Responsive Task List for Progress Tracking",
        items: [
            "Build a responsive checklist page/component in your frontend",
            "Each task above should be a checkbox item",
            "Allow tasks to be checked off as completed",
            "(Optional) Save progress in localStorage for persistence"
        ]
    }
];

const STORAGE_KEY = "adonai_task_checklist";

const TaskChecklist = () => {
    const [checkedTasks, setCheckedTasks] = useState(() => {
        try {
            const storedTasks = localStorage.getItem(STORAGE_KEY);
            return storedTasks ? JSON.parse(storedTasks) : {};
        } catch (error) {
            console.error("Failed to parse tasks from localStorage", error);
            return {};
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedTasks));
        } catch (error) {
            console.error("Failed to save tasks to localStorage", error);
        }
    }, [checkedTasks]);

    const handleCheckboxChange = (sectionIndex, itemIndex) => {
        const key = `${sectionIndex}-${itemIndex}`;
        setCheckedTasks(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getSectionProgress = (sectionIndex) => {
        const sectionTasks = TASKS[sectionIndex].items;
        const completedCount = sectionTasks.reduce((count, _, itemIndex) => {
            const key = `${sectionIndex}-${itemIndex}`;
            return checkedTasks[key] ? count + 1 : count;
        }, 0);
        return (completedCount / sectionTasks.length) * 100;
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Project Task Checklist</h1>
                <p style={styles.subtitle}>Track our progress on enhancing the Adonai Farm project.</p>
            </header>
            <main style={styles.main}>
                {TASKS.map((section, sectionIndex) => (
                    <section key={sectionIndex} style={styles.section}>
                        <h2 style={styles.sectionTitle}>{section.section}</h2>
                        <div style={styles.progressBarContainer}>
                            <div style={{ ...styles.progressBar, width: `${getSectionProgress(sectionIndex)}%` }}></div>
                        </div>
                        <ul style={styles.taskList}>
                            {section.items.map((item, itemIndex) => {
                                const key = `${sectionIndex}-${itemIndex}`;
                                return (
                                    <li key={itemIndex} style={styles.taskItem}>
                                        <label style={styles.label}>
                                            <input
                                                type="checkbox"
                                                checked={!!checkedTasks[key]}
                                                onChange={() => handleCheckboxChange(sectionIndex, itemIndex)}
                                                style={styles.checkbox}
                                            />
                                            <span style={checkedTasks[key] ? styles.checkedText : {}}>{item}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
            </main>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        lineHeight: 1.6,
        backgroundColor: '#f4f4f9',
        color: '#333',
        maxWidth: '960px',
        margin: '2rem auto',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    header: {
        textAlign: 'center',
        padding: '1rem',
        borderBottom: '1px solid #ddd'
    },
    title: {
        color: '#2c3e50',
        margin: 0
    },
    subtitle: {
        color: '#7f8c8d',
        margin: '0.5rem 0 0'
    },
    main: {
        padding: '1rem 0'
    },
    section: {
        backgroundColor: '#fff',
        padding: '1.5rem',
        margin: '1rem 0',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
    },
    sectionTitle: {
        color: '#2980b9',
        borderBottom: '2px solid #3498db',
        paddingBottom: '0.5rem',
        marginBottom: '1rem'
    },
    taskList: {
        listStyle: 'none',
        padding: 0
    },
    taskItem: {
        padding: '0.5rem 0',
        borderBottom: '1px solid #ecf0f1'
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
    },
    checkbox: {
        marginRight: '10px'
    },
    checkedText: {
        textDecoration: 'line-through',
        color: '#95a5a6'
    },
    progressBarContainer: {
        backgroundColor: '#ecf0f1',
        borderRadius: '5px',
        height: '10px',
        marginBottom: '1rem'
    },
    progressBar: {
        backgroundColor: '#3498db',
        height: '100%',
        borderRadius: '5px',
        transition: 'width 0.3s ease-in-out'
    }
};

export default TaskChecklist;
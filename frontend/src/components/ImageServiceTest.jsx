import React, { useEffect, useState } from 'react';
import ImageService from '../services/ImageService';

const ImageServiceTest = () => {
    const [testResults, setTestResults] = useState({});

    useEffect(() => {
        console.log('🧪 Testing ImageService...');

        // Test 1: Get all public images
        const allImages = ImageService.getPublicImages('all');
        console.log('🧪 All images:', allImages.length, allImages);

        // Test 2: Get animals category
        const animalImages = ImageService.getPublicImages('animals');
        console.log('🧪 Animal images:', animalImages.length, animalImages);

        // Test 3: Get farm category
        const farmImages = ImageService.getPublicImages('farm');
        console.log('🧪 Farm images:', farmImages.length, farmImages);

        // Test 4: Check localStorage
        const localStorageData = localStorage.getItem('adonai_gallery');
        const parsedData = localStorageData ? JSON.parse(localStorageData) : null;
        console.log('🧪 LocalStorage data:', parsedData ? parsedData.length : 'null', parsedData);

        setTestResults({
            allImages: allImages.length,
            animalImages: animalImages.length,
            farmImages: farmImages.length,
            localStorageCount: parsedData ? parsedData.length : 0,
            firstFewImages: allImages.slice(0, 5).map(img => img.filename)
        });
    }, []);

    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
            <h3>🧪 ImageService Test Results</h3>
            <pre>{JSON.stringify(testResults, null, 2)}</pre>
        </div>
    );
};

export default ImageServiceTest;
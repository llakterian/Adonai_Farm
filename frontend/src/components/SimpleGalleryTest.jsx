import React from 'react';
import ImageService from '../services/ImageService';

const SimpleGalleryTest = () => {
    // Get images directly without any state management
    const allImages = ImageService.getPublicImages('all');

    console.log('🧪 SimpleGalleryTest: Direct ImageService call returned:', allImages.length, 'images');
    console.log('🧪 First 10 images:', allImages.slice(0, 10).map(img => img.filename));

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', margin: '20px', borderRadius: '8px' }}>
            <h2>🧪 Simple Gallery Test</h2>
            <p><strong>Total Images Found:</strong> {allImages.length}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '20px' }}>
                {allImages.map((image, index) => (
                    <div key={image.filename} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                        <img
                            src={`/images/${image.filename}`}
                            alt={image.alt}
                            style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '3px' }}
                            onError={(e) => {
                                console.error('Failed to load image:', image.filename);
                                e.target.style.backgroundColor = '#ffcccc';
                                e.target.alt = `Failed: ${image.filename}`;
                            }}
                            onLoad={() => console.log('✅ Loaded:', image.filename)}
                        />
                        <p style={{ fontSize: '12px', margin: '5px 0 0 0', wordBreak: 'break-word' }}>
                            {index + 1}. {image.filename}
                        </p>
                        <p style={{ fontSize: '10px', color: '#666', margin: '2px 0 0 0' }}>
                            Category: {image.category}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleGalleryTest;
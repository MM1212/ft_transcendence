import React, { useEffect, useState } from 'react';

const MyComponent: React.FC = () => {
  const [data, setData] = useState<string>('');

  useEffect(() => {
    // Simulating an asynchronous operation with a promise
    const fetchData = (): Promise<string> => {
      return new Promise((resolve) => {
        // Simulate a delay
        setTimeout(() => {
          // Resolve with some data
          resolve('Hello, React with TypeScript!');
        }, 1000);
      });
    };

    // Using the promise
    fetchData()
      .then((result) => {
        // Set the data in the state when the promise is resolved
        setData(result);
      })
      .catch((error) => {
        // Handle errors if the promise is rejected
        console.error('Error fetching data:', error);
      });
  }, []); // Run this effect only once on mount

  return <div>{data}</div>;
};

export default MyComponent;


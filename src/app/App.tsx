import { RouterProvider } from 'react-router';
import { router } from './routes';
import { GardenProvider } from './context/GardenContext';

export default function App() {
  return (
    <GardenProvider>
      <RouterProvider router={router} />
    </GardenProvider>
  );
}

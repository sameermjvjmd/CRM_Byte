import { useEffect, useState } from 'react';
import { Droppable, type DroppableProps } from '@hello-pangea/dnd';

/**
 * StrictModeDroppable is a wrapper around @hello-pangea/dnd's Droppable
 * that works with React 18's StrictMode by delaying the render.
 * 
 * This is needed because the library doesn't fully support the 
 * double-render behavior of StrictMode in React 18.
 */
const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        // Small delay to allow the animation frame to complete
        const animation = requestAnimationFrame(() => setEnabled(true));

        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    if (!enabled) {
        return null;
    }

    return <Droppable {...props}>{children}</Droppable>;
};

export default StrictModeDroppable;

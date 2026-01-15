import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Card } from '.';

describe('Card', () => {
    it('renders correctly', () => {
        render(<Card>Test Card</Card>);

        expect(screen.getByText('Test Card')).toBeInTheDocument();
    });
});

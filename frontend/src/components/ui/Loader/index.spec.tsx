import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Loader } from './';

describe('Loader', () => {
    it('renders correctly', () => {
        render(<Loader />);

        expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });
});

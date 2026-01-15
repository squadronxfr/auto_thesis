import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { DatePicker } from '.';

describe('DatePicker', () => {
    it('renders correctly', () => {
        render(<DatePicker label="Test DatePicker" onChange={() => {}} />);

        expect(screen.getByText('Test DatePicker')).toBeInTheDocument();
    });
});

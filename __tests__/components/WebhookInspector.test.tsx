import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WebhookInspector from '@/components/tools/WebhookInspector';

describe('WebhookInspector Component', () => {
  it('renders headers and body textareas', () => {
    render(<WebhookInspector />);
    expect(screen.getByLabelText(/HTTP Request Headers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Webhook Payload/i)).toBeInTheDocument();
  });

  it('computes HMAC signature digest', async () => {
    render(<WebhookInspector />);
    const computeBtn = screen.getByRole('button', { name: /Compute Signature Digest/i });
    fireEvent.click(computeBtn);
    expect(screen.getByText(/HMAC Signature Calculator/i)).toBeInTheDocument();
  });
});

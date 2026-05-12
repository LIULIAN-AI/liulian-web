import { describe, it, expect, vi } from 'vitest';
import { renderWithIntl, screen, userEvent } from './test-utils';
import ChatInput from '@/components/chat/ChatInput';

function getInputField() {
  const inputs = screen.getAllByRole('textbox');
  return inputs[inputs.length - 1];
}

function getSendButton() {
  const buttons = screen.getAllByRole('button', { name: /send message/i });
  return buttons[buttons.length - 1];
}

describe('ChatInput', () => {
  it('renders input and send button', () => {
    renderWithIntl(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(getInputField()).toBeInTheDocument();
    expect(getSendButton()).toBeInTheDocument();
  });

  it('calls onSend when clicking send button', async () => {
    const onSend = vi.fn();
    renderWithIntl(<ChatInput value="Hello" onChange={vi.fn()} onSend={onSend} disabled={false} />);
    await userEvent.click(getSendButton());
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('calls onSend when pressing Enter', async () => {
    const onSend = vi.fn();
    renderWithIntl(<ChatInput value="Hello" onChange={vi.fn()} onSend={onSend} disabled={false} />);
    const input = getInputField();
    input.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('disables send button when disabled prop is true', () => {
    renderWithIntl(<ChatInput value="Hello" onChange={vi.fn()} onSend={vi.fn()} disabled={true} />);
    expect(getSendButton()).toBeDisabled();
  });

  it('disables send button when value is empty', () => {
    renderWithIntl(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(getSendButton()).toBeDisabled();
  });

  it('renders stop button while streaming and triggers onStop', async () => {
    const onStop = vi.fn();
    renderWithIntl(
      <ChatInput
        value="Hello"
        onChange={vi.fn()}
        onSend={vi.fn()}
        onStop={onStop}
        isStreaming
        disabled
      />,
    );
    const stopButtons = screen.getAllByRole('button', { name: /stop response/i });
    const stopButton = stopButtons[stopButtons.length - 1];
    expect(stopButton).toBeInTheDocument();
    expect(stopButton).not.toBeDisabled();
    await userEvent.click(stopButton);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});

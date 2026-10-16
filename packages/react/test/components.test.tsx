import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Combobox,
  CommandPalette,
  DatePicker,
  Dialog,
  DropdownMenu,
  Mosaic,
  Navbar,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Select,
  SidebarNav,
  Switch,
  Table,
  Tabs,
  TextField,
  ToastProvider,
  Tooltip,
  useToast
} from '../src';

const templates = [
  { value: 'mono', label: 'Mono', description: 'Dense, one column.' },
  { value: 'serif', label: 'Serif' },
  { value: 'grid', label: 'Grid' },
  { value: 'minimal', label: 'Minimal', disabled: true }
];

describe('basics', () => {
  it('Button shows a spinner and disables while loading', () => {
    render(<Button loading>Saving</Button>);
    const b = screen.getByRole('button', { name: 'Saving' });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute('aria-busy', 'true');
  });

  it('TextField links its error to the input', () => {
    render(<TextField label="Email" error="Enter a complete email address." />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a complete email address.');
  });

  it('Checkbox, Switch and RadioGroup are native controls', async () => {
    const onChange = vi.fn();
    render(
      <>
        <Checkbox label="Cover letter" />
        <Switch label="Public link" />
        <RadioGroup label="Size" options={['Letter', 'A4']} defaultValue="Letter" onChange={onChange} />
      </>
    );
    await userEvent.click(screen.getByLabelText('Cover letter'));
    expect(screen.getByLabelText('Cover letter')).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Public link' })).not.toBeChecked();
    await userEvent.click(screen.getByLabelText('A4'));
    expect(onChange).toHaveBeenCalledWith('A4');
  });

  it('Badge, Avatar, Card, Alert, Progress render their roles', () => {
    render(
      <>
        <Badge tone="success" live>
          Live
        </Badge>
        <Avatar name="Ada Lovelace" />
        <Card title="Grid" eyebrow="Featured" motif>
          Body
        </Card>
        <Alert tone="danger" title="Upload failed">
          Too big.
        </Alert>
        <Progress label="Profile" value={3} max={5} steps />
      </>
    );
    expect(screen.getByText('Live')).toHaveClass('ts-badge-live');
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
    expect(screen.getByRole('heading', { name: 'Grid' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
    expect(screen.getByRole('progressbar', { name: 'Profile' })).toHaveAttribute('aria-valuenow', '3');
  });

  it('Table renders custom cells', () => {
    render(<Table caption="Apps" columns={[{ key: 'co', header: 'Company' }, { key: 'n', header: 'Days', align: 'right', render: (r: { co: string; n: number }) => `${r.n}d` }]} rows={[{ co: 'Globex', n: 31 }]} />);
    expect(screen.getByRole('table', { name: 'Apps' })).toBeInTheDocument();
    expect(screen.getByText('31d')).toHaveClass('ts-num');
  });

  it('Mosaic renders columns × rows tiles with one saffron tile', () => {
    const { container } = render(<Mosaic columns={6} rows={4} />);
    expect(container.querySelectorAll('.ts-mosaic-tile')).toHaveLength(24);
    expect(container.querySelectorAll('[data-c="4"]')).toHaveLength(1);
  });
});

describe('Select', () => {
  it('opens with the keyboard, skips disabled options and picks with Enter', async () => {
    const onChange = vi.fn();
    render(<Select label="Template" options={templates} defaultValue="grid" onChange={onChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Template' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: /Grid/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger.getAttribute('aria-activedescendant')).toMatch(/opt-0$/);
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('mono', expect.objectContaining({ label: 'Mono' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('Mono');
  });

  it('type-ahead selects while closed', async () => {
    render(<Select label="Template" options={templates} />);
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('s');
    expect(screen.getByRole('combobox')).toHaveTextContent('Serif');
  });

  it('closes on Escape and on an outside click', async () => {
    render(<Select label="Template" options={templates} />);
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await userEvent.click(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Combobox', () => {
  it('filters as you type and picks the highlighted match', async () => {
    const onChange = vi.fn();
    render(<Combobox label="Template" options={templates} onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'Template' });
    await userEvent.type(input, 'gr');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Grid');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('grid', expect.anything());
    expect(input).toHaveValue('Grid');
  });

  it('shows the empty state when nothing matches', async () => {
    render(<Combobox label="Template" options={templates} emptyText="Nothing here" />);
    await userEvent.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  it('moves with arrow keys and shows the matching panel', async () => {
    render(<Tabs label="Sections" items={[{ id: 'a', label: 'One', content: 'First' }, { id: 'b', label: 'Two', content: 'Second' }]} />);
    screen.getByRole('tab', { name: 'One' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second');
  });
});

describe('Accordion', () => {
  it('single mode keeps one section open', async () => {
    render(<Accordion items={[{ id: 'a', title: 'Shipping', content: 'A' }, { id: 'b', title: 'Returns', content: 'B' }]} defaultValue={['a']} />);
    const a = screen.getByRole('button', { name: 'Shipping' });
    const b = screen.getByRole('button', { name: 'Returns' });
    expect(a).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(b);
    expect(a).toHaveAttribute('aria-expanded', 'false');
    expect(b).toHaveAttribute('aria-expanded', 'true');
    b.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(a).toHaveFocus();
  });
});

describe('Dialog', () => {
  it('moves focus in and closes on Escape', async () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog open={open} onClose={() => setOpen(false)} title="Delete this resume?" actions={<Button>Delete</Button>}>
          Gone for good.
        </Dialog>
      );
    }
    render(<Demo />);
    const dialog = screen.getByRole('dialog', { name: 'Delete this resume?' });
    expect(dialog).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Popover and Tooltip', () => {
  it('Popover toggles from its trigger and closes on Escape, returning focus', async () => {
    render(
      <Popover trigger={<Button>Share</Button>} title="Share link">
        <TextField label="Link" defaultValue="https://example.com" />
      </Popover>
    );
    const trigger = screen.getByRole('button', { name: 'Share' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('dialog', { name: 'Share link' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Link')).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('Tooltip appears on focus and describes its trigger', async () => {
    render(
      <Tooltip content="Copy share link" placement="bottom">
        <Button>Share</Button>
      </Tooltip>
    );
    const b = screen.getByRole('button', { name: 'Share' });
    act(() => b.focus());
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy share link');
    expect(b).toHaveAccessibleDescription('Copy share link');
  });
});

describe('DropdownMenu', () => {
  it('opens with ArrowDown, moves, runs the item and returns focus', async () => {
    const dup = vi.fn();
    const del = vi.fn();
    render(
      <DropdownMenu
        trigger={<Button>Actions</Button>}
        items={[{ label: 'Duplicate', onSelect: dup }, { type: 'separator' }, { label: 'Archive', disabled: true }, { label: 'Delete', danger: true, onSelect: del }]}
      />
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(menu).toHaveFocus());
    expect(menu.getAttribute('aria-activedescendant')).toMatch(/item-0$/);
    await userEvent.keyboard('{ArrowDown}');
    expect(menu.getAttribute('aria-activedescendant')).toMatch(/item-3$/);
    await userEvent.keyboard('{Enter}');
    expect(del).toHaveBeenCalledOnce();
    expect(dup).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('selects with a click', async () => {
    const dup = vi.fn();
    render(<DropdownMenu trigger={<Button>Actions</Button>} items={[{ label: 'Duplicate', onSelect: dup }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));
    expect(dup).toHaveBeenCalledOnce();
  });
});

describe('Navigation', () => {
  it('Breadcrumbs mark the current page and expand the collapsed middle', async () => {
    render(<Breadcrumbs maxItems={3} items={[{ label: 'Home', href: '/' }, { label: 'Resumes', href: '/r' }, { label: '2026', href: '/r/2026' }, { label: 'Globex' }]} />);
    expect(screen.getByText('Globex')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByText('Resumes')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show full path' }));
    expect(screen.getByText('Resumes')).toBeInTheDocument();
  });

  it('Pagination reports page changes and marks the current page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={10} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('Navbar toggles its mobile menu', async () => {
    render(<Navbar brand="Tessera" links={[{ label: 'Docs', href: '#', active: true }, { label: 'Blog', href: '#' }]} />);
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const sheet = screen.getByRole('navigation', { name: 'Main (mobile)' });
    expect(within(sheet).getByText('Docs')).toHaveAttribute('aria-current', 'page');
  });

  it('SidebarNav opens the group that holds the current page', async () => {
    render(<SidebarNav sections={[{ title: 'Workspace', items: [{ label: 'Resumes', icon: 'file', items: [{ label: 'Globex', href: '#', active: true }] }, { label: 'Settings', icon: 'settings', href: '#' }] }]} />);
    const group = screen.getByRole('button', { name: 'Resumes' });
    expect(group).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Globex' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('SidebarNav collapsed', () => {
  const sections = [{ title: 'Workspace', items: [{ label: 'Home', icon: 'home' as const, href: '#' }, { label: 'Resumes', icon: 'file' as const, items: [{ label: 'Globex', href: '#', active: true }] }] }];

  it('collapses with the icon toggle and keeps the highlight on the group', async () => {
    const onCollapsedChange = vi.fn();
    render(<SidebarNav collapsible sections={sections} onCollapsedChange={onCollapsedChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    const toggle = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    // The active sub-item is no longer in the list; its group's icon carries the highlight.
    expect(screen.queryByRole('link', { name: 'Globex' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resumes' })).toHaveClass('ts-side-within');
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('opens a group as a flyout and closes it on Escape', async () => {
    render(<SidebarNav defaultCollapsed sections={sections} />);
    const group = screen.getByRole('button', { name: 'Resumes' });
    await userEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'true');
    const link = await screen.findByRole('link', { name: 'Globex' });
    expect(link).toHaveAttribute('aria-current', 'page');
    await waitFor(() => expect(link).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    expect(group).toHaveAttribute('aria-expanded', 'false');
    expect(group).toHaveFocus();
  });
});

describe('DatePicker', () => {
  it('opens a calendar, moves by keyboard and picks a day', async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Start date" defaultValue={new Date(2026, 9, 15)} onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: 'Start date Oct 15, 2026' });
    await userEvent.click(trigger);
    const grid = await screen.findByRole('grid', { name: 'October 2026' });
    const focused = await waitFor(() => {
      const el = within(grid).getByRole('button', { name: /October 15, 2026/ });
      expect(el).toHaveFocus();
      return el;
    });
    expect(focused).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledOnce();
    const picked: Date = onChange.mock.calls[0][0];
    expect([picked.getMonth(), picked.getDate()]).toEqual([9, 23]);
    await waitFor(() => expect(trigger).toHaveTextContent('Oct 23, 2026'));
  });

  it('PageDown moves to the next month', async () => {
    render(<DatePicker label="Day" defaultValue={new Date(2026, 0, 31)} />);
    await userEvent.click(screen.getByRole('button', { name: /Day/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /January 31, 2026/ })).toHaveFocus());
    await userEvent.keyboard('{PageDown}');
    expect(await screen.findByRole('grid', { name: 'February 2026' })).toBeInTheDocument();
  });
});

describe('CommandPalette', () => {
  it('filters, ranks and runs a command', async () => {
    const exportPdf = vi.fn();
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          commands={[
            { id: 'new', label: 'New resume', group: 'Create', onRun: vi.fn() },
            { id: 'pdf', label: 'Export PDF', group: 'File', keywords: ['download'], onRun: exportPdf }
          ]}
        />
      );
    }
    render(<Demo />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'downl');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    expect(exportPdf).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Toasts', () => {
  it('useToast shows a toast that leaves on its own', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    function Raise() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: 'Saved', duration: 1000 })}>Save</button>;
    }
    render(
      <ToastProvider>
        <Raise />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('useToast outside a provider explains the fix', () => {
    function Bad() {
      useToast();
      return null;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

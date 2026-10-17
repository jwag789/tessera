import { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Button,
  Container,
  Divider,
  Drawer,
  EmptyState,
  FileDropzone,
  Grid,
  Inline,
  NumberInput,
  SegmentedControl,
  Slider,
  Spinner,
  Stack,
  Stepper,
  Table,
  TagInput,
  Textarea,
  ThemeProvider,
  acceptsFile,
  compareValues,
  formatBytes,
  space,
  useTheme
} from '../src';

describe('layout primitives', () => {
  it('maps spacing steps to tokens', () => {
    expect(space(4)).toBe('var(--space-4)');
    expect(space(0.5)).toBe('var(--space-0-5)');
    expect(space(0)).toBe('0');
  });

  it('Stack, Inline, Grid and Container render with token spacing', () => {
    render(
      <Container size="md" data-testid="c">
        <Stack gap={6} data-testid="s" as="section">
          <Inline gap={2} data-testid="i">
            <span>a</span>
          </Inline>
          <Grid minChildWidth={200} data-testid="g" />
        </Stack>
        <Divider label="or" />
      </Container>
    );
    expect(screen.getByTestId('c')).toHaveClass('ts-container-md');
    expect(screen.getByTestId('s').tagName).toBe('SECTION');
    expect(screen.getByTestId('s')).toHaveStyle({ gap: 'var(--space-6)' });
    expect(screen.getByTestId('i')).toHaveStyle({ columnGap: 'var(--space-2)', flexWrap: 'wrap' });
    expect(screen.getByTestId('g').style.gridTemplateColumns).toContain('minmax(min(100%, 200px), 1fr)');
    expect(screen.getByRole('separator')).toHaveTextContent('or');
  });

  it('Spinner and EmptyState announce themselves', () => {
    render(
      <>
        <Spinner label="Saving" />
        <EmptyState title="No resumes yet" description="Start from a template." actions={<Button>New resume</Button>} />
      </>
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saving');
    expect(screen.getByRole('heading', { name: 'No resumes yet' })).toBeInTheDocument();
  });
});

describe('Textarea', () => {
  it('counts characters against maxLength', async () => {
    render(<Textarea label="Summary" maxLength={20} hint="Two sentences." />);
    const box = screen.getByLabelText('Summary');
    await userEvent.type(box, 'Hello');
    expect(screen.getByText('5 / 20')).toBeInTheDocument();
    expect(box).toHaveAccessibleDescription('Two sentences.');
  });
});

describe('Slider', () => {
  it('reports values and a readable value text', () => {
    const onChange = vi.fn();
    render(<Slider label="Experience" min={0} max={20} defaultValue={5} format={(v) => `${v} years`} onChange={onChange} />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('aria-valuetext', '5 years');
    fireEvent.change(input, { target: { value: '8' } });
    expect(onChange).toHaveBeenCalledWith(8);
    expect(screen.getByText('8 years')).toBeInTheDocument();
  });
});

describe('SegmentedControl', () => {
  it('is a radio group that changes with clicks and arrows', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="View" options={['List', 'Board', 'Calendar']} onChange={onChange} />);
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    await userEvent.click(screen.getByText('Board'));
    expect(onChange).toHaveBeenLastCalledWith('Board');
    expect(screen.getByRole('radio', { name: 'Board' })).toBeChecked();
    // Arrow keys between options are the browser's native radio behavior (checked in the docs, not jsdom).
  });
});

describe('NumberInput', () => {
  it('steps with buttons and arrows, and clamps on blur', async () => {
    const onChange = vi.fn();
    render(<NumberInput label="Years" defaultValue={3} min={0} max={10} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: 'Years' });
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(input).toHaveValue('4');
    input.focus();
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(input).toHaveValue('10');
    await userEvent.clear(input);
    await userEvent.type(input, '42');
    fireEvent.blur(input);
    expect(input).toHaveValue('10');
    expect(onChange).toHaveBeenLastCalledWith(10);
  });
});

describe('TagInput', () => {
  it('adds with Enter or comma, rejects duplicates and removes with Backspace', async () => {
    const onChange = vi.fn();
    render(<TagInput label="Skills" defaultValue={['React']} onChange={onChange} />);
    const input = screen.getByLabelText('Skills');
    await userEvent.type(input, 'TypeScript{Enter}Figma,');
    expect(onChange).toHaveBeenLastCalledWith(['React', 'TypeScript', 'Figma']);
    await userEvent.type(input, 'react{Enter}');
    expect(screen.getByText('“react” is already added.')).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith(['React', 'TypeScript']);
    await userEvent.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(onChange).toHaveBeenLastCalledWith(['TypeScript']);
  });
});

describe('FileDropzone', () => {
  it('matches accept rules and formats sizes', () => {
    expect(acceptsFile({ name: 'cv.PDF', type: 'application/pdf' }, '.pdf,.docx')).toBe(true);
    expect(acceptsFile({ name: 'me.png', type: 'image/png' }, 'image/*')).toBe(true);
    expect(acceptsFile({ name: 'me.png', type: 'image/png' }, '.pdf')).toBe(false);
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(3 * 1048576)).toBe('3.0 MB');
  });

  it('accepts dropped files and explains rejections', async () => {
    const onFilesChange = vi.fn();
    render(<FileDropzone label="Resume" accept=".pdf" maxSize={1000} multiple onFilesChange={onFilesChange} />);
    const ok = new File(['x'.repeat(10)], 'resume.pdf', { type: 'application/pdf' });
    const big = new File(['x'.repeat(2000)], 'huge.pdf', { type: 'application/pdf' });
    const wrong = new File(['x'], 'photo.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText('Resume'), [ok, big, wrong], { applyAccept: false });
    expect(onFilesChange).toHaveBeenCalledWith([ok]);
    expect(screen.getByText(/huge\.pdf is over 1000 B\. photo\.png isn’t an accepted file type\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove resume.pdf' }));
    expect(onFilesChange).toHaveBeenLastCalledWith([]);
  });
});

describe('Drawer', () => {
  it('opens as a modal dialog and closes on Escape', async () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer open={open} onClose={() => setOpen(false)} title="Application" description="Globex · Frontend Lead" footer={<Button>Save</Button>}>
          Notes
        </Drawer>
      );
    }
    render(<Demo />);
    const d = screen.getByRole('dialog', { name: 'Application' });
    expect(d).toHaveAccessibleDescription('Globex · Frontend Lead');
    expect(d).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Stepper', () => {
  it('marks the current step and lets you go back to completed ones', async () => {
    const onStepClick = vi.fn();
    render(<Stepper current={1} onStepClick={onStepClick} steps={[{ id: 'a', label: 'Basics' }, { id: 'b', label: 'Experience' }, { id: 'c', label: 'Review' }]} />);
    const items = within(screen.getByRole('navigation', { name: 'Progress' })).getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).toHaveTextContent('(completed)');
    await userEvent.click(screen.getByRole('button', { name: /Basics/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
    expect(screen.queryByRole('button', { name: /Review/ })).not.toBeInTheDocument();
  });
});

describe('Table sorting and selection', () => {
  const rows = [
    { id: 1, company: 'Northwind', days: 12 },
    { id: 2, company: 'Globex', days: 31 },
    { id: 3, company: 'initech', days: 4 }
  ];
  const columns = [
    { key: 'company', header: 'Company', sortable: true },
    { key: 'days', header: 'Days', align: 'right' as const, sortable: true }
  ];
  const firstColumn = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell').at(-2)?.textContent);

  it('compares naturally and keeps empties last', () => {
    expect(['b10', 'b2', 'a'].sort(compareValues)).toEqual(['a', 'b2', 'b10']);
    expect([3, null, 1].sort(compareValues)).toEqual([1, 3, null]);
  });

  it('cycles ascending, descending, unsorted', async () => {
    render(<Table caption="Apps" rows={rows} columns={columns} selectable rowLabel={(r) => r.company} />);
    const header = screen.getByRole('columnheader', { name: /Company/ });
    await userEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(firstColumn()).toEqual(['Globex', 'initech', 'Northwind']);
    await userEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(firstColumn()).toEqual(['Northwind', 'initech', 'Globex']);
    await userEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'none');
  });

  it('selects rows, with a select-all that goes indeterminate', async () => {
    const onSelectionChange = vi.fn();
    render(<Table caption="Apps" rows={rows} columns={columns} selectable rowLabel={(r) => r.company} onSelectionChange={onSelectionChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Globex' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([2]);
    const all = screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    await userEvent.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith([2, 1, 3]);
    expect(screen.getByRole('checkbox', { name: 'Deselect all rows' })).toBeChecked();
  });
});

describe('ThemeProvider', () => {
  function Switcher() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    return (
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme}/{resolvedTheme}
      </button>
    );
  }

  it('sets data-theme on the document, remembers the choice and applies token overrides', async () => {
    render(
      <ThemeProvider defaultTheme="light" storageKey="t-theme" tokens={{ lapis: '#0f766e' }}>
        <Switcher />
      </ThemeProvider>
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.style.getPropertyValue('--lapis')).toBe('#0f766e');
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('dark/dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('t-theme')).toBe('dark');
  });

  it('switches theme packs with data-brand and remembers them', async () => {
    function Brand() {
      const { brand, setBrand } = useTheme();
      return <button onClick={() => setBrand('cartridge')}>{brand}</button>;
    }
    render(
      <ThemeProvider storageKey="t2">
        <Brand />
      </ThemeProvider>
    );
    expect(document.documentElement).not.toHaveAttribute('data-brand');
    await userEvent.click(screen.getByRole('button', { name: 'tessera' }));
    expect(document.documentElement).toHaveAttribute('data-brand', 'cartridge');
    expect(localStorage.getItem('t2:brand')).toBe('cartridge');
  });

  it('can theme just a subtree', () => {
    const { container } = render(
      <ThemeProvider scope="local" theme="dark" brand="gloop">
        <span>inside</span>
      </ThemeProvider>
    );
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'dark');
    expect(container.firstElementChild).toHaveAttribute('data-brand', 'gloop');
  });
});

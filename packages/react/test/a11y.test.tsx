// Runs axe-core against every component in a realistic state. Color contrast is checked separately
// (jsdom can't compute styles); the token contrast table in the docs covers it.
import axe from 'axe-core';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as T from '../src';

async function violations(ui: ReactElement) {
  const { container } = render(<main>{ui}</main>);
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } }
  });
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
}

const opts = [
  { value: 'mono', label: 'Mono', description: 'Dense' },
  { value: 'grid', label: 'Grid', badge: 'New' }
];
const rows = [{ id: 1, company: 'Globex', days: 31 }];

const cases: Record<string, ReactElement> = {
  Button: (
    <T.Inline>
      <T.Button>Save</T.Button>
      <T.Button variant="tile" iconRight={<T.Icon name="arrow" />}>
        Start
      </T.Button>
      <T.Button loading>Saving</T.Button>
    </T.Inline>
  ),
  TextField: <T.TextField label="Email" icon="mail" error="Enter a complete email address." />,
  Textarea: <T.Textarea label="Summary" maxLength={200} hint="Two sentences." />,
  Select: <T.Select label="Template" options={opts} defaultValue="grid" defaultOpen />,
  Combobox: <T.Combobox label="Company" options={opts} />,
  DatePicker: <T.DatePicker label="Start date" defaultValue={new Date(2026, 9, 15)} />,
  Calendar: <T.Calendar defaultValue={new Date(2026, 9, 15)} />,
  Slider: <T.Slider label="Experience" defaultValue={5} max={20} marks={[{ value: 0 }, { value: 20 }]} />,
  SegmentedControl: <T.SegmentedControl label="View" options={['List', 'Board']} />,
  NumberInput: <T.NumberInput label="Years" defaultValue={3} min={0} max={10} suffix="years" />,
  TagInput: <T.TagInput label="Skills" defaultValue={['React', 'TypeScript']} />,
  FileDropzone: <T.FileDropzone label="Resume" accept=".pdf" maxSize={10485760} />,
  Choices: (
    <T.Stack>
      <T.Checkbox label="Cover letter" />
      <T.Switch label="Public link" defaultChecked />
      <T.RadioGroup label="Size" options={['Letter', 'A4']} defaultValue="A4" />
    </T.Stack>
  ),
  Status: (
    <T.Inline>
      <T.Badge tone="success" live>
        Live
      </T.Badge>
      <T.Avatar name="Ada Lovelace" />
      <T.Spinner />
      <T.Kbd>⌘K</T.Kbd>
    </T.Inline>
  ),
  Card: (
    <T.Card title="Grid" eyebrow="Featured" motif interactive actions={<T.Button size="sm">Open</T.Button>}>
      Two columns.
    </T.Card>
  ),
  Feedback: (
    <T.Stack>
      <T.Alert tone="danger" title="Upload failed" onDismiss={() => {}}>
        Too big.
      </T.Alert>
      <T.Progress label="Profile" value={3} max={5} steps />
      <T.Progress label="Upload" value={40} />
      <T.Skeleton lines={2} />
      <T.Toast title="Saved" action={{ label: 'Undo', onClick: () => {} }} onDismiss={() => {}} />
      <T.EmptyState title="No resumes yet" actions={<T.Button>New resume</T.Button>} />
    </T.Stack>
  ),
  Tabs: <T.Tabs label="Sections" items={[{ id: 'a', label: 'One', content: 'First' }, { id: 'b', label: 'Two', content: 'Second' }]} />,
  Accordion: <T.Accordion defaultValue={['a']} items={[{ id: 'a', title: 'Shipping', content: 'A' }, { id: 'b', title: 'Returns', content: 'B' }]} />,
  Table: <T.Table caption="Apps" rows={rows} selectable rowLabel={(r) => r.company} stickyHeader columns={[{ key: 'company', header: 'Company', sortable: true }, { key: 'days', header: 'Days', align: 'right' }]} />,
  Navigation: (
    <T.Stack>
      <T.Navbar brand="Tessera" links={[{ label: 'Docs', href: '#', active: true }]} actions={<T.Button size="sm">Start</T.Button>} />
      <T.Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Resumes', href: '/r' }, { label: 'Globex' }]} />
      <T.Pagination page={3} pageCount={10} onPageChange={() => {}} />
      <T.Stepper current={1} steps={[{ id: 'a', label: 'Basics' }, { id: 'b', label: 'Experience' }, { id: 'c', label: 'Review' }]} />
    </T.Stack>
  ),
  SidebarNav: <T.SidebarNav collapsible sections={[{ title: 'Workspace', items: [{ label: 'Home', icon: 'home', href: '#', active: true }, { label: 'Resumes', icon: 'file', items: [{ label: 'Globex', href: '#' }] }] }]} />,
  SidebarCollapsed: <T.SidebarNav defaultCollapsed collapsible sections={[{ items: [{ label: 'Home', icon: 'home', href: '#' }, { label: 'Resumes', icon: 'file', items: [{ label: 'Globex', href: '#', active: true }] }] }]} />,
  Overlays: (
    <T.Inline>
      <T.Popover trigger={<T.Button>Share</T.Button>} title="Share" defaultOpen autoFocus={false}>
        <T.TextField label="Link" defaultValue="https://x.dev" readOnly />
      </T.Popover>
      <T.Tooltip content="Copy link" open>
        <T.Button>Copy</T.Button>
      </T.Tooltip>
      <T.DropdownMenu trigger={<T.Button>Actions</T.Button>} items={[{ label: 'Duplicate' }, { type: 'separator' }, { label: 'Delete', danger: true }]} />
    </T.Inline>
  ),
  Dialog: (
    <T.Dialog open title="Delete this resume?" onClose={() => {}} actions={<T.Button variant="danger">Delete</T.Button>}>
      Gone for good.
    </T.Dialog>
  ),
  Drawer: (
    <T.Drawer open title="Application" description="Globex" onClose={() => {}} footer={<T.Button>Save</T.Button>}>
      <T.TextField label="Notes" />
    </T.Drawer>
  ),
  CommandPalette: <T.CommandPalette open onOpenChange={() => {}} commands={[{ id: 'a', label: 'Export PDF', group: 'File', onRun: () => {} }]} />,
  Mosaic: (
    <T.Mosaic columns={4} rows={2}>
      <h2>Built from tiles</h2>
    </T.Mosaic>
  ),
  Layout: (
    <T.Container>
      <T.Grid columns={2}>
        <p>One</p>
        <p>Two</p>
      </T.Grid>
      <T.Divider label="or" />
    </T.Container>
  )
};

describe('accessibility (axe)', () => {
  for (const [name, ui] of Object.entries(cases)) {
    it(`${name} has no violations`, async () => {
      expect(await violations(ui)).toEqual([]);
    });
  }
});

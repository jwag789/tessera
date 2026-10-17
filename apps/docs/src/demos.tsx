import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Accordion,
  Container,
  Divider,
  Drawer,
  EmptyState,
  FileDropzone,
  Grid,
  Inline,
  Kbd,
  NumberInput,
  SegmentedControl,
  Slider,
  Spinner,
  Stack,
  Stepper,
  TagInput,
  Textarea,
  useTheme,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  Calendar,
  Card,
  Checkbox,
  Combobox,
  CommandPalette,
  DatePicker,
  Dialog,
  DropdownMenu,
  Icon,
  Mosaic,
  Navbar,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Select,
  SidebarNav,
  Skeleton,
  Switch,
  Table,
  Tabs,
  TextField,
  Toast,
  Tooltip,
  useToast
} from '@tessera/react';

export interface Demo {
  name: string;
  group: string;
  isNew?: boolean;
  /** Components whose props tables appear on this page. Default: just `name`. */
  props?: string[];
  /** Stage layout: centered row (default), a narrow column, wide, or top-aligned for things that open downward. */
  layout?: 'row' | 'stack' | 'wide' | 'top';
  minHeight?: number;
  render: () => ReactNode;
  snippet: string;
}

const templates = [
  { value: 'mono', label: 'Mono', description: 'Dense, one column. For engineers.', icon: 'M' },
  { value: 'serif', label: 'Serif', description: 'Editorial headings, generous margins.', icon: 'S' },
  { value: 'grid', label: 'Grid', description: 'Two columns with a skills sidebar.', icon: 'G', badge: 'New' },
  { value: 'minimal', label: 'Minimal', description: 'Coming soon.', icon: '—', disabled: true }
];

const companies = ['Globex', 'Initech', 'Northwind', 'Umbrella', 'Hooli', 'Stark Industries', 'Wayne Enterprises', 'Acme', 'Cyberdyne', 'Soylent', 'Vandelay', 'Wonka', 'Tyrell', 'Monarch'].map((c) => ({
  value: c.toLowerCase().replace(/\s+/g, '-'),
  label: c,
  icon: c.slice(0, 1)
}));

function DialogDemo() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Delete resume
      </Button>
      <Dialog
        inline
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this resume?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </>
        }
      >
        “Frontend — Globex” and its 3 exported PDFs will be removed. You can’t undo this.
      </Dialog>
    </>
  );
}

function ToasterDemo() {
  const { toast } = useToast();
  return (
    <div className="demo-col">
      <Toast title="Link copied" duration={6000} action={{ label: 'Undo', onClick: () => {} }} onDismiss={() => {}}>
        Anyone with the link can view your resume.
      </Toast>
      <Button variant="secondary" iconLeft={<Icon name="sparkle" />} onClick={() => toast({ title: 'Exported', description: 'ada-lovelace-resume.pdf', icon: 'success' })}>
        Raise a live toast
      </Button>
    </div>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(6);
  return (
    <div className="demo-col" style={{ alignItems: 'center' }}>
      <Pagination page={page} pageCount={20} onPageChange={setPage} />
      <span className="demo-note">Page {page} of 20</span>
    </div>
  );
}

function CommandDemo() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const run = (label: string) => () => toast({ title: label, icon: 'success', duration: 2500 });
  return (
    <div className="demo-col" style={{ alignItems: 'center' }}>
      <Button variant="secondary" iconLeft={<Icon name="search" />} onClick={() => setOpen(true)}>
        Search commands
        <kbd className="ts-kbd" style={{ marginLeft: 8 }}>
          ⌘K
        </kbd>
      </Button>
      <span className="demo-note">Or press ⌘K / Ctrl+K anywhere in these docs.</span>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={[
          { id: 'new', label: 'New resume', group: 'Create', icon: 'plus', shortcut: '⌘N', onRun: run('New resume') },
          { id: 'dup', label: 'Duplicate resume', group: 'Create', icon: 'copy', onRun: run('Duplicated') },
          { id: 'pdf', label: 'Export PDF', group: 'File', icon: 'file', shortcut: '⌘E', keywords: ['download', 'save'], onRun: run('Exported') },
          { id: 'share', label: 'Copy share link', group: 'File', icon: 'external', onRun: run('Link copied') },
          { id: 'settings', label: 'Open settings', group: 'Go to', icon: 'settings', onRun: run('Settings') },
          { id: 'logout', label: 'Sign out', group: 'Go to', icon: 'logout', onRun: run('Signed out') }
        ]}
      />
    </div>
  );
}

const mark = (
  <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true">
    <rect x="4" y="4" width="18" height="18" rx="3" fill="var(--lapis)" />
    <rect x="4" y="26" width="18" height="18" rx="3" fill="var(--lapis)" />
    <rect x="26" y="26" width="18" height="18" rx="3" fill="var(--lapis)" />
    <rect x="28" y="0" width="18" height="18" rx="3" fill="var(--saffron)" />
  </svg>
);

export const DEMOS: Demo[] = [
  {
    name: 'Button',
    group: 'Actions',
    render: () => (
      <div className="demo-row">
        <Button iconRight={<Icon name="arrow" />}>Export PDF</Button>
        <Button variant="secondary">Preview</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Delete resume</Button>
        <Button variant="tile" size="lg" iconRight={<Icon name="arrow" />}>
          Start building
        </Button>
        <Button loading>Saving</Button>
        <Button size="sm" variant="secondary">
          Small
        </Button>
      </div>
    ),
    snippet: '<Button iconRight={<Icon name="arrow" />}>Export PDF</Button>\n<Button variant="secondary">Preview</Button>\n<Button variant="tile" size="lg">Start building</Button>\n<Button loading>Saving</Button>'
  },
  {
    name: 'DropdownMenu',
    group: 'Actions',
    isNew: true,
    layout: 'top',
    minHeight: 300,
    render: () => (
      <DropdownMenu
        trigger={
          <Button variant="secondary" iconRight={<Icon name="chevron" />}>
            Resume actions
          </Button>
        }
        items={[
          { type: 'label', label: 'Frontend — Globex' },
          { label: 'Duplicate', icon: 'copy', shortcut: '⌘D' },
          { label: 'Export PDF', icon: 'file', shortcut: '⌘E' },
          { label: 'Copy share link', icon: 'external' },
          { label: 'Archive', icon: 'file', disabled: true },
          { type: 'separator' },
          { label: 'Delete', icon: 'trash', danger: true }
        ]}
      />
    ),
    snippet: '<DropdownMenu\n  trigger={<Button variant="secondary">Resume actions</Button>}\n  items={[\n    { label: "Duplicate", icon: "copy", shortcut: "⌘D", onSelect: duplicate },\n    { type: "separator" },\n    { label: "Delete", icon: "trash", danger: true, onSelect: remove },\n  ]}\n/>'
  },
  {
    name: 'CommandPalette',
    group: 'Actions',
    isNew: true,
    render: () => <CommandDemo />,
    snippet: 'const [open, setOpen] = useState(false);\nuseHotkey("mod+k", () => setOpen(true));\n\n<CommandPalette open={open} onOpenChange={setOpen} commands={[\n  { id: "pdf", label: "Export PDF", group: "File", icon: "file",\n    keywords: ["download"], onRun: exportPdf },\n]} />'
  },
  {
    name: 'TextField',
    group: 'Forms',
    layout: 'stack',
    render: () => (
      <>
        <TextField label="Search templates" icon="search" placeholder="Engineering, design, sales…" />
        <TextField label="Email" icon="mail" type="email" defaultValue="ada@" error="Enter a complete email address." />
      </>
    ),
    snippet: '<TextField label="Email" icon="mail" type="email"\n  value={email} onChange={e => setEmail(e.target.value)}\n  error={invalid && "Enter a complete email address."} />'
  },
  {
    name: 'Select',
    group: 'Forms',
    layout: 'top',
    minHeight: 380,
    render: () => <Select label="Template" options={templates} defaultValue="grid" defaultOpen hint="You can switch templates any time." className="demo-field" />,
    snippet: '<Select label="Template" value={template} onChange={setTemplate} options={[\n  { value: "mono", label: "Mono", description: "Dense, one column.", icon: "M" },\n  { value: "grid", label: "Grid", description: "Two columns.", icon: "G", badge: "New" },\n]} />'
  },
  {
    name: 'Combobox',
    group: 'Forms',
    isNew: true,
    layout: 'top',
    minHeight: 380,
    render: () => <Combobox label="Company" options={companies} placeholder="Search 14 companies" hint="Try typing “in” or “wo”." className="demo-field" />,
    snippet: '<Combobox label="Company" options={companies}\n  value={company} onChange={setCompany}\n  placeholder="Search companies" emptyText="No companies match" />'
  },
  {
    name: 'DatePicker',
    group: 'Forms',
    isNew: true,
    props: ['DatePicker', 'Calendar'],
    layout: 'top',
    minHeight: 400,
    render: () => (
      <div className="demo-split">
        <DatePicker label="Start date" defaultValue={new Date(2026, 9, 15)} className="demo-field" />
        <div className="ts-popover" style={{ padding: 12 }}>
          <Calendar defaultValue={new Date(2026, 9, 23)} />
        </div>
      </div>
    ),
    snippet: '<DatePicker label="Start date" value={date} onChange={setDate}\n  min={new Date()} name="start" />\n\n<Calendar value={date} onChange={setDate} weekStartsOn={1} />'
  },
  {
    name: 'Checkbox',
    group: 'Forms',
    render: () => (
      <div className="demo-col">
        <Checkbox label="Include a cover letter" defaultChecked />
        <Checkbox label="Show my phone number" />
        <Checkbox label="Hide graduation year" disabled />
      </div>
    ),
    snippet: '<Checkbox label="Include a cover letter" defaultChecked />'
  },
  {
    name: 'RadioGroup',
    group: 'Forms',
    render: () => <RadioGroup label="Page size" defaultValue="letter" options={[{ value: 'letter', label: 'US Letter' }, { value: 'a4', label: 'A4' }, { value: 'legal', label: 'Legal', disabled: true }]} />,
    snippet: '<RadioGroup label="Page size" defaultValue="letter"\n  options={[{ value: "letter", label: "US Letter" }, { value: "a4", label: "A4" }]}\n  onChange={setSize} />'
  },
  {
    name: 'Switch',
    group: 'Forms',
    render: () => (
      <div className="demo-col">
        <Switch label="Public profile link" defaultChecked />
        <Switch label="Email me when someone views it" />
      </div>
    ),
    snippet: '<Switch label="Public profile link" checked={isPublic}\n  onChange={e => setPublic(e.target.checked)} />'
  },
  {
    name: 'Navbar',
    group: 'Navigation',
    isNew: true,
    layout: 'wide',
    render: () => (
      <div className="demo-frame">
        <Navbar
          brand={
            <a href="#c-Navbar">
              {mark}
              Tessera
            </a>
          }
          links={[{ label: 'Templates', href: '#c-Navbar', active: true }, { label: 'Examples', href: '#c-Navbar' }, { label: 'Pricing', href: '#c-Navbar' }]}
          actions={
            <>
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
              <Button size="sm">Start free</Button>
            </>
          }
        />
        <div className="demo-frame-body">Resize the window below 768px to see the links fold into a menu.</div>
      </div>
    ),
    snippet: '<Navbar sticky\n  brand={<a href="/"><Logo /> Tessera</a>}\n  links={[{ label: "Templates", href: "/templates", active: true }, { label: "Pricing", href: "/pricing" }]}\n  actions={<Button size="sm">Start free</Button>} />'
  },
  {
    name: 'SidebarNav',
    group: 'Navigation',
    isNew: true,
    layout: 'wide',
    render: () => <SidebarDemo />,
    snippet: '<SidebarNav collapsible sections={[\n  { title: "Workspace", items: [\n    { label: "Home", icon: "home", href: "/", active: true },\n    { label: "Resumes", icon: "file", badge: 4, items: [\n      { label: "Frontend — Globex", href: "/r/1" },\n    ] },\n  ] },\n]} />'
  },
  {
    name: 'Tabs',
    group: 'Navigation',
    layout: 'stack',
    render: () => (
      <Tabs
        label="Resume sections"
        items={[
          { id: 'exp', label: 'Experience', content: '4 roles · last edited today' },
          { id: 'edu', label: 'Education', content: '2 entries' },
          { id: 'skills', label: 'Skills', content: '18 skills in 3 groups' },
          { id: 'proj', label: 'Projects', content: 'No projects yet' }
        ]}
      />
    ),
    snippet: '<Tabs label="Resume sections" items={[\n  { id: "exp", label: "Experience", content: <Roles /> },\n  { id: "edu", label: "Education", content: <Schools /> },\n]} />'
  },
  {
    name: 'Breadcrumbs',
    group: 'Navigation',
    isNew: true,
    render: () => (
      <div className="demo-col">
        <Breadcrumbs items={[{ label: 'Home', href: '#c-Breadcrumbs' }, { label: 'Resumes', href: '#c-Breadcrumbs' }, { label: 'Frontend — Globex' }]} />
        <Breadcrumbs items={[{ label: 'Home', href: '#c-Breadcrumbs' }, { label: 'Workspace', href: '#c-Breadcrumbs' }, { label: 'Resumes', href: '#c-Breadcrumbs' }, { label: '2026', href: '#c-Breadcrumbs' }, { label: 'Globex' }]} />
      </div>
    ),
    snippet: '<Breadcrumbs items={[\n  { label: "Home", href: "/" },\n  { label: "Resumes", href: "/resumes" },\n  { label: "Frontend — Globex" },\n]} />'
  },
  {
    name: 'Pagination',
    group: 'Navigation',
    isNew: true,
    render: () => <PaginationDemo />,
    snippet: '<Pagination page={page} pageCount={20} onPageChange={setPage} />'
  },
  {
    name: 'Card',
    group: 'Layout',
    layout: 'wide',
    render: () => (
      <div className="demo-grid">
        <Card interactive eyebrow="Default" title="flat" actions={<Button size="sm" variant="secondary">Open</Button>}>
          A hairline border. Use it for most cards: a project, a role, a setting.
        </Card>
        <Card interactive variant="raised" eyebrow="Floating" title="raised" actions={<Button size="sm" variant="secondary">Open</Button>}>
          A soft shadow instead of a border, for things that float above the page.
        </Card>
        <Card interactive motif variant="tile" eyebrow="Featured" title="tile + motif" actions={<Button size="sm">Open</Button>}>
          Ink border and the hard brand shadow. One per view. Hover it.
        </Card>
      </div>
    ),
    snippet: '<Card variant="tile" motif interactive eyebrow="Featured" title="Grid"\n  actions={<Button size="sm">Open</Button>}>\n  A two-column layout with a skills sidebar.\n</Card>'
  },
  {
    name: 'Accordion',
    group: 'Layout',
    isNew: true,
    layout: 'stack',
    render: () => (
      <Accordion
        defaultValue={['ats']}
        items={[
          { id: 'ats', title: 'Will my resume pass ATS filters?', content: 'Every template exports real text in a single column order, so applicant tracking systems read it the way a person would.' },
          { id: 'pages', title: 'How long should it be?', content: 'One page for under ten years of experience. Two is fine after that, if the second page earns its place.' },
          { id: 'export', title: 'Which file should I send?', content: 'PDF, unless the posting asks for something else. It looks the same everywhere.' }
        ]}
      />
    ),
    snippet: '<Accordion type="single" defaultValue={["ats"]} items={[\n  { id: "ats", title: "Will it pass ATS filters?", content: "…" },\n  { id: "pages", title: "How long should it be?", content: "…" },\n]} />'
  },
  {
    name: 'Table',
    group: 'Data',
    layout: 'wide',
    render: () => <TableDemo />,
    snippet: '<Table caption="Applications" rows={apps} selectable rowLabel={r => r.company}\n  selected={selected} onSelectionChange={setSelected} stickyHeader maxHeight={320}\n  columns={[\n    { key: "company", header: "Company", sortable: true },\n    { key: "status", header: "Status", render: r => <Badge tone={r.tone} dot>{r.status}</Badge> },\n    { key: "days", header: "Days", align: "right", sortable: true },\n  ]} />'
  },
  {
    name: 'Badge',
    group: 'Status',
    render: () => (
      <div className="demo-row">
        <Badge>Draft</Badge>
        <Badge tone="brand">Template</Badge>
        <Badge tone="success" live>
          Live
        </Badge>
        <Badge tone="warning" dot>
          Needs review
        </Badge>
        <Badge tone="danger" dot>
          Export failed
        </Badge>
        <Badge tone="accent">New</Badge>
      </div>
    ),
    snippet: '<Badge tone="success" live>Live</Badge>\n<Badge tone="accent">New</Badge>'
  },
  {
    name: 'Avatar',
    group: 'Status',
    props: ['Avatar'],
    render: () => (
      <div className="demo-row">
        <Avatar name="Ada Lovelace" size={48} />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" size={28} />
        <AvatarGroup>
          <Avatar name="Linus T" />
          <Avatar name="Margaret Hamilton" />
          <Avatar name="Ken Thompson" />
          <Avatar name="Radia Perlman" />
        </AvatarGroup>
      </div>
    ),
    snippet: '<AvatarGroup>\n  <Avatar name="Ada Lovelace" />\n  <Avatar name="Grace Hopper" src="/grace.jpg" />\n</AvatarGroup>'
  },
  {
    name: 'Alert',
    group: 'Feedback',
    layout: 'stack',
    render: () => (
      <>
        <Alert tone="info" title="Tip">
          Recruiters skim the top third. Lead with your strongest role.
        </Alert>
        <Alert tone="success" title="Exported">
          resume-2026.pdf is in your downloads.
        </Alert>
        <Alert tone="warning" title="Two pages">
          Most roles expect one. Trim older positions to fit.
        </Alert>
        <Alert tone="danger" title="Upload failed" onDismiss={() => {}}>
          That file is over 10 MB. Try a smaller PDF.
        </Alert>
      </>
    ),
    snippet: '<Alert tone="danger" title="Upload failed" onDismiss={close}>\n  That file is over 10 MB. Try a smaller PDF.\n</Alert>'
  },
  {
    name: 'Toast',
    group: 'Feedback',
    render: () => <ToasterDemo />,
    snippet: '// Once, near the root:\n<ToastProvider><App /></ToastProvider>\n\n// Anywhere below it:\nconst { toast } = useToast();\ntoast({ title: "Exported", description: "resume.pdf", icon: "success",\n  action: { label: "Undo", onClick: undo } });'
  },
  {
    name: 'Progress',
    group: 'Feedback',
    layout: 'stack',
    render: () => (
      <>
        <Progress label="Uploading resume.pdf" value={64} />
        <Progress label="Profile complete" value={3} max={5} steps />
      </>
    ),
    snippet: '<Progress label="Uploading resume.pdf" value={64} />\n<Progress label="Profile complete" value={3} max={5} steps />'
  },
  {
    name: 'Skeleton',
    group: 'Feedback',
    render: () => (
      <Card style={{ width: 320 }}>
        <div className="demo-col" style={{ gap: 20, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton circle size={40} />
            <div style={{ flex: 1 }}>
              <Skeleton lines={2} height={10} />
            </div>
          </div>
          <Skeleton lines={3} />
        </div>
      </Card>
    ),
    snippet: '<Skeleton circle size={40} />\n<Skeleton lines={3} />'
  },
  {
    name: 'Dialog',
    group: 'Overlays',
    minHeight: 320,
    render: () => <DialogDemo />,
    snippet: '<Dialog open={open} onClose={() => setOpen(false)} title="Delete this resume?"\n  actions={<>\n    <Button variant="ghost" onClick={() => setOpen(false)}>Keep it</Button>\n    <Button variant="danger" onClick={remove}>Delete</Button>\n  </>}>\n  This removes the resume and its exported PDFs.\n</Dialog>'
  },
  {
    name: 'Popover',
    group: 'Overlays',
    isNew: true,
    layout: 'top',
    minHeight: 320,
    render: () => (
      <Popover
        defaultOpen
        autoFocus={false}
        title="Share your resume"
        width={320}
        trigger={
          <Button variant="secondary" iconLeft={<Icon name="external" />}>
            Share
          </Button>
        }
      >
        <div className="demo-col" style={{ alignItems: 'stretch', gap: 14 }}>
          <TextField label="Public link" defaultValue="tessera.app/r/ada-lovelace" readOnly />
          <Switch label="Anyone with the link can view" defaultChecked />
          <Button size="sm" iconLeft={<Icon name="copy" />}>
            Copy link
          </Button>
        </div>
      </Popover>
    ),
    snippet: '<Popover title="Share your resume" trigger={<Button variant="secondary">Share</Button>}>\n  <TextField label="Public link" value={url} readOnly />\n  <Button size="sm" onClick={copy}>Copy link</Button>\n</Popover>'
  },
  {
    name: 'Tooltip',
    group: 'Overlays',
    minHeight: 160,
    render: () => (
      <div className="demo-row" style={{ columnGap: 110, rowGap: 64, padding: '36px 64px' }}>
        <Tooltip content="Copy share link" placement="top" open>
          <Button variant="secondary" size="sm">
            Top
          </Button>
        </Tooltip>
        <Tooltip content="Download PDF" placement="bottom" open>
          <Button variant="secondary" size="sm">
            Bottom
          </Button>
        </Tooltip>
        <Tooltip content="Undo" placement="left" open>
          <Button variant="secondary" size="sm">
            Left
          </Button>
        </Tooltip>
        <Tooltip content="Redo" placement="right" open>
          <Button variant="secondary" size="sm">
            Right
          </Button>
        </Tooltip>
      </div>
    ),
    snippet: '<Tooltip content="Copy share link" placement="bottom">\n  <Button variant="secondary" size="sm">Share</Button>\n</Tooltip>'
  },
  {
    name: 'Textarea',
    group: 'Forms',
    isNew: true,
    layout: 'stack',
    render: () => <Textarea label="Professional summary" maxLength={280} hint="Two or three sentences. Lead with what you're best at." defaultValue="Frontend engineer who turns design systems into shipped product. 8 years across React, TypeScript and accessibility." />,
    snippet: '<Textarea label="Professional summary" maxLength={280}\n  value={summary} onChange={e => setSummary(e.target.value)} />'
  },
  {
    name: 'Slider',
    group: 'Forms',
    isNew: true,
    layout: 'stack',
    render: () => (
      <>
        <Slider label="Years of experience" min={0} max={20} defaultValue={8} format={(v) => (v === 20 ? '20+ years' : `${v} years`)} marks={[{ value: 0 }, { value: 5 }, { value: 10 }, { value: 15 }, { value: 20, label: '20+' }]} />
        <Slider label="Remote preference" defaultValue={70} format={(v) => `${v}% remote`} />
      </>
    ),
    snippet: '<Slider label="Years of experience" min={0} max={20}\n  value={years} onChange={setYears} format={v => `${v} years`}\n  marks={[{ value: 0 }, { value: 10 }, { value: 20, label: "20+" }]} />'
  },
  {
    name: 'SegmentedControl',
    group: 'Forms',
    isNew: true,
    render: () => (
      <div className="demo-col" style={{ alignItems: 'center' }}>
        <SegmentedControl label="View" options={['List', 'Board', 'Calendar']} defaultValue="Board" />
        <SegmentedControl label="Page size" size="sm" options={[{ value: 'letter', label: 'US Letter' }, { value: 'a4', label: 'A4' }]} />
      </div>
    ),
    snippet: '<SegmentedControl label="View" options={["List", "Board", "Calendar"]}\n  value={view} onChange={setView} />'
  },
  {
    name: 'NumberInput',
    group: 'Forms',
    isNew: true,
    layout: 'stack',
    render: () => (
      <>
        <NumberInput label="Years at this role" defaultValue={3} min={0} max={50} suffix="years" hint="Arrow keys step by 1, Shift+arrow by 10." />
        <NumberInput label="Expected salary (k)" defaultValue={140} min={0} step={5} suffix="k USD" />
      </>
    ),
    snippet: '<NumberInput label="Years at this role" min={0} max={50} suffix="years"\n  value={years} onChange={setYears} />'
  },
  {
    name: 'TagInput',
    group: 'Forms',
    isNew: true,
    layout: 'stack',
    render: () => <TagInput label="Skills" defaultValue={['React', 'TypeScript', 'Accessibility']} max={12} hint="Press Enter or comma to add. Backspace removes the last one." />,
    snippet: '<TagInput label="Skills" value={skills} onChange={setSkills} max={12}\n  validate={t => t.length > 24 ? "Keep each skill under 24 characters." : undefined} />'
  },
  {
    name: 'FileDropzone',
    group: 'Forms',
    isNew: true,
    layout: 'stack',
    render: () => <FileDropzone label="Import an existing resume" accept=".pdf,.docx" maxSize={5 * 1024 * 1024} hint="We'll pull your roles and education out of it." />,
    snippet: '<FileDropzone label="Import a resume" accept=".pdf,.docx" maxSize={5 * 1024 * 1024}\n  files={files} onFilesChange={setFiles} />'
  },
  {
    name: 'Stepper',
    group: 'Navigation',
    isNew: true,
    layout: 'wide',
    render: () => <StepperDemo />,
    snippet: '<Stepper current={step} onStepClick={setStep} steps={[\n  { id: "basics", label: "Basics", description: "Name and role" },\n  { id: "exp", label: "Experience" },\n  { id: "review", label: "Review" },\n]} />'
  },
  {
    name: 'Drawer',
    group: 'Overlays',
    isNew: true,
    minHeight: 420,
    render: () => <DrawerDemo />,
    snippet: '<Drawer open={open} onClose={() => setOpen(false)} title="Northwind"\n  description="Staff Engineer · applied Oct 3"\n  footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button>Save</Button></>}>\n  …\n</Drawer>'
  },
  {
    name: 'EmptyState',
    group: 'Feedback',
    isNew: true,
    layout: 'stack',
    render: () => <EmptyState title="No applications yet" description="Track every role you apply to, with its status and the resume you sent." actions={<><Button iconLeft={<Icon name="plus" />}>Add application</Button><Button variant="ghost">Import from CSV</Button></>} />,
    snippet: '<EmptyState title="No applications yet"\n  description="Track every role you apply to."\n  actions={<Button iconLeft={<Icon name="plus" />}>Add application</Button>} />'
  },
  {
    name: 'Spinner',
    group: 'Feedback',
    isNew: true,
    props: ['Spinner'],
    render: () => (
      <div className="demo-row" style={{ gap: 28 }}>
        <Spinner size={16} />
        <Spinner />
        <Spinner size={32} />
        <span style={{ color: 'var(--saffron)' }}>
          <span style={{ display: 'inline-flex' }}>
            <Spinner size={32} label="Exporting" className="demo-spin-accent" />
          </span>
        </span>
        <span className="demo-note">
          Pair with <Kbd>esc</Kbd> to cancel long work.
        </span>
      </div>
    ),
    snippet: '<Spinner />\n<Spinner size={32} label="Exporting" />'
  },
  {
    name: 'Layout',
    group: 'Layout',
    isNew: true,
    layout: 'wide',
    props: ['Stack', 'Inline', 'Grid', 'Container', 'Divider'],
    render: () => <LayoutDemo />,
    snippet: '<Container size="lg">\n  <Stack gap={6}>\n    <Inline justify="between">\n      <h2>Templates</h2>\n      <Button>New</Button>\n    </Inline>\n    <Grid minChildWidth={200} gap={4}>{cards}</Grid>\n    <Divider label="or" />\n  </Stack>\n</Container>'
  },
  {
    name: 'ThemeProvider',
    group: 'Theming',
    isNew: true,
    props: ['ThemeProvider'],
    render: () => <ThemeDemo />,
    snippet: '<ThemeProvider defaultTheme="system" storageKey="theme"\n  tokens={{ lapis: "#0f766e" }}>\n  <App />\n</ThemeProvider>\n\nconst { theme, resolvedTheme, setTheme } = useTheme();'
  },
  {
    name: 'Mosaic',
    group: 'Brand',
    layout: 'wide',
    render: () => (
      <Mosaic columns={18} rows={7} seed={11} style={{ width: '100%' }}>
        <div className="demo-col" style={{ alignItems: 'flex-start' }}>
          <span className="eyebrow" style={{ color: 'var(--on-lapis-deep)', textTransform: 'uppercase', opacity: 0.8 }}>
            Move your pointer across it
          </span>
          <h2 className="display-lg" style={{ margin: 0, color: 'var(--on-lapis-deep)' }}>
            Built from tiles.
          </h2>
        </div>
      </Mosaic>
    ),
    snippet: '<Mosaic columns={18} rows={7} seed={11}>\n  <h2 className="display-lg">Built from tiles.</h2>\n</Mosaic>'
  }
];

const apps = [
  { id: 1, company: 'Northwind', role: 'Staff Engineer', status: 'Interview', tone: 'brand' as const, days: 12 },
  { id: 2, company: 'Globex', role: 'Frontend Lead', status: 'Offer', tone: 'success' as const, days: 31 },
  { id: 3, company: 'Initech', role: 'Senior Engineer', status: 'Applied', tone: 'neutral' as const, days: 4 },
  { id: 4, company: 'Umbrella', role: 'Design Engineer', status: 'Rejected', tone: 'danger' as const, days: 19 }
];

function SidebarDemo() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="demo-frame demo-frame-side">
      <SidebarNav
        collapsible
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '800 17px/1 var(--font-display)' }}>
            {mark}
            {!collapsed && 'Workspace'}
          </div>
        }
        sections={[
          {
            title: 'Workspace',
            items: [
              { label: 'Home', icon: 'home', href: '#c-SidebarNav' },
              {
                label: 'Resumes',
                icon: 'file',
                badge: 4,
                items: [
                  { label: 'Frontend — Globex', href: '#c-SidebarNav', active: true },
                  { label: 'Staff — Northwind', href: '#c-SidebarNav' },
                  { label: 'Design Eng — Umbrella', href: '#c-SidebarNav' }
                ]
              },
              { label: 'Cover letters', icon: 'mail', href: '#c-SidebarNav' }
            ]
          },
          { title: 'Account', items: [{ label: 'Profile', icon: 'user', href: '#c-SidebarNav' }, { label: 'Settings', icon: 'settings', href: '#c-SidebarNav' }] }
        ]}
      />
      <div className="demo-frame-body">Collapse it with the icon at the bottom, then click the Resumes icon to open its flyout.</div>
    </div>
  );
}

const allApps = [
  ...apps,
  { id: 5, company: 'Hooli', role: 'Platform Engineer', status: 'Interview', tone: 'brand' as const, days: 7 },
  { id: 6, company: 'Stark Industries', role: 'UI Engineer', status: 'Applied', tone: 'neutral' as const, days: 2 },
  { id: 7, company: 'Acme', role: 'Staff Frontend', status: 'Offer', tone: 'success' as const, days: 44 }
];

function TableDemo() {
  const [selected, setSelected] = useState<Array<string | number>>([2]);
  return (
    <Stack gap={3}>
      <Inline justify="between">
        <span className="demo-note">{selected.length ? `${selected.length} selected` : 'Click a header to sort; tick rows to select.'}</span>
        <Button size="sm" variant="secondary" disabled={!selected.length} onClick={() => setSelected([])}>
          Clear selection
        </Button>
      </Inline>
      <Table
        caption="Applications"
        rows={allApps}
        selectable
        rowLabel={(r) => r.company}
        selected={selected}
        onSelectionChange={setSelected}
        stickyHeader
        maxHeight={300}
        defaultSort={{ key: 'days', direction: 'desc' }}
        columns={[
          { key: 'company', header: 'Company', sortable: true },
          { key: 'role', header: 'Role' },
          { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge tone={r.tone} dot>{r.status}</Badge> },
          { key: 'days', header: 'Days', align: 'right', sortable: true }
        ]}
      />
    </Stack>
  );
}

function StepperDemo() {
  const [step, setStep] = useState(1);
  const steps = [
    { id: 'basics', label: 'Basics', description: 'Name and role' },
    { id: 'exp', label: 'Experience', description: '4 roles' },
    { id: 'skills', label: 'Skills', description: 'Up to 12' },
    { id: 'review', label: 'Review', description: 'Export PDF' }
  ];
  return (
    <Stack gap={6}>
      <Stepper steps={steps} current={step} onStepClick={setStep} />
      <Inline justify="between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <Button iconRight={<Icon name="arrow" />} onClick={() => setStep(Math.min(steps.length, step + 1))} disabled={step >= steps.length}>
          {step >= steps.length - 1 ? 'Finish' : 'Continue'}
        </Button>
      </Inline>
      <div style={{ maxWidth: 280 }}>
        <Stepper steps={steps} current={step} onStepClick={setStep} orientation="vertical" label="Progress (vertical)" />
      </div>
    </Stack>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open application</Button>
      <Drawer
        inline
        open={open}
        onClose={() => setOpen(false)}
        title="Northwind"
        description="Staff Engineer · applied Oct 3"
        size={360}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <Stack gap={4}>
          <Select label="Status" options={['Applied', 'Interview', 'Offer', 'Rejected']} defaultValue="Interview" />
          <Textarea label="Notes" defaultValue="Second round Thursday. Ask about the design system team." />
        </Stack>
      </Drawer>
    </>
  );
}

function ThemeDemo() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <Stack gap={4} align="center">
      <SegmentedControl label="Theme" options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={theme} onChange={(v) => setTheme(v as typeof theme)} />
      <span className="demo-note">
        Showing <b>{resolvedTheme}</b>. These docs run inside a ThemeProvider, so this switch and the one in the sidebar are the same state.
      </span>
    </Stack>
  );
}

const SPACE_PX: Record<number, number> = { 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 };

function Box({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <span className={'lay-box' + (wide ? ' lay-box-wide' : '')}>{children}</span>;
}

function LayoutPanel({ name, code, note, children }: { name: string; code: string; note: string; children: ReactNode }) {
  return (
    <div className="lay-panel">
      <div className="lay-head">
        <b>{name}</b>
        <code>{code}</code>
      </div>
      <p className="lay-note">{note}</p>
      <div className="lay-canvas">{children}</div>
    </div>
  );
}

function LayoutDemo() {
  const [gap, setGap] = useState<2 | 3 | 4 | 6 | 8>(4);
  const [cols, setCols] = useState(140);
  return (
    <Stack gap={5}>
      <Inline gap={6} align="end">
        <div style={{ flex: '1 1 220px' }}>
          <Slider label="gap" min={0} max={4} value={[2, 3, 4, 6, 8].indexOf(gap)} onChange={(i) => setGap(([2, 3, 4, 6, 8] as const)[i])} format={(i) => { const g = [2, 3, 4, 6, 8][i]; return `${g} · space-${g} · ${SPACE_PX[g]}px`; }} />
        </div>
        <div style={{ flex: '1 1 220px' }}>
          <Slider label="Grid minChildWidth" min={80} max={240} step={20} value={cols} onChange={setCols} format={(v) => `${v}px`} />
        </div>
      </Inline>
      <p className="lay-legend">
        <span className="lay-swatch lay-swatch-box" /> child <span className="lay-swatch lay-swatch-gap" /> gap (the striped space is what the token controls)
      </p>
      <div className="lay-panels">
        <LayoutPanel name="Stack" code={`<Stack gap={${gap}}>`} note="A column. The default for vertical rhythm: form fields, sections, card bodies.">
          <Stack gap={gap} className="lay-gapped">
            <Box wide>Heading</Box>
            <Box wide>Paragraph</Box>
            <Box wide>Actions</Box>
          </Stack>
        </LayoutPanel>
        <LayoutPanel name="Inline" code={`<Inline gap={${gap}}>`} note={'A row that wraps. Button groups, tags, toolbars. justify="between" pushes to the ends.'}>
          <Inline gap={gap} className="lay-gapped">
            {['React', 'TypeScript', 'Accessibility', 'Design systems', 'Figma'].map((t) => (
              <Box key={t}>{t}</Box>
            ))}
          </Inline>
        </LayoutPanel>
        <LayoutPanel name="Grid" code={`<Grid minChildWidth={${cols}} gap={${gap}}>`} note="As many equal columns as fit at the minimum width. Reflows from phone to desktop with no media queries.">
          <Grid minChildWidth={cols} gap={gap} className="lay-gapped">
            {Array.from({ length: 6 }, (_, i) => (
              <Box key={i}>{i + 1}</Box>
            ))}
          </Grid>
        </LayoutPanel>
        <LayoutPanel name="Container + Divider" code={'<Container size="sm">'} note="Container centers content at a readable max width with the page gutter. Divider separates groups.">
          <div className="lay-container-frame">
            <Container size="sm" className="lay-container">
              <Stack gap={3}>
                <Box wide>Max width</Box>
                <Divider label="or" />
                <Box wide>Next group</Box>
              </Stack>
            </Container>
          </div>
        </LayoutPanel>
      </div>
    </Stack>
  );
}

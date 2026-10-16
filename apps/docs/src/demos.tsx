import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Accordion,
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
    snippet: '<SidebarNav sections={[\n  { title: "Workspace", items: [\n    { label: "Home", icon: "home", href: "/", active: true },\n    { label: "Resumes", icon: "file", badge: 4, items: [\n      { label: "Frontend — Globex", href: "/r/1" },\n    ] },\n  ] },\n]} />'
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
    render: () => (
      <Table
        caption="Applications"
        columns={[
          { key: 'company', header: 'Company' },
          { key: 'role', header: 'Role' },
          { key: 'status', header: 'Status', render: (r: (typeof apps)[number]) => <Badge tone={r.tone} dot>{r.status}</Badge> },
          { key: 'days', header: 'Days', align: 'right' }
        ]}
        rows={apps}
      />
    ),
    snippet: '<Table caption="Applications" rows={apps} columns={[\n  { key: "company", header: "Company" },\n  { key: "status", header: "Status", render: r => <Badge tone={r.tone} dot>{r.status}</Badge> },\n  { key: "days", header: "Days", align: "right" },\n]} />'
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
        collapsed={collapsed}
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
        footer={
          <Button size="sm" variant="ghost" block iconLeft={<Icon name={collapsed ? 'chevron-right' : 'chevron-left'} />} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '' : 'Collapse'}
          </Button>
        }
      />
      <div className="demo-frame-body">Open “Resumes”, then try Collapse.</div>
    </div>
  );
}

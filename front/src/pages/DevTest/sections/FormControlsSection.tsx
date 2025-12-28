import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Textarea,
  Select,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  DatePicker,
  DateRangePicker,
  TimePicker,
  Button,
  Badge,
} from '@/components/ui';
import {
  Type,
  Hash,
  CircleCheck,
  ChevronDown,
  Settings,
  Check,
  Calendar,
  FileText,
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  DollarSign,
  Search,
  MapPin,
  AtSign,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { countryOptions, priorityOptions, categoryOptions } from './constants';

export function FormControlsSection() {
  // Text input states
  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  // Textarea states
  const [textareaValue, setTextareaValue] = useState('');
  const [bioValue, setBioValue] = useState('');

  // Select states
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Toggle states
  const [checked, setChecked] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Radio states
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedPayment, setSelectedPayment] = useState('card');

  // Date states
  const [singleDate, setSingleDate] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();

  // Time states
  const [selectedTime, setSelectedTime] = useState<string | undefined>('07:00');

  return (
    <div className="space-y-6">
      {/* Text Inputs - Basic */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Text Inputs - Basic
          </CardTitle>
          <CardDescription>Standard text input variations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              startIcon={<User className="h-4 w-4" />}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              startIcon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              startIcon={<Lock className="h-4 w-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
              startIcon={<Phone className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Inputs - Special Types */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Text Inputs - Special Types
          </CardTitle>
          <CardDescription>URL, number, search, and other input types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Website URL"
              type="url"
              placeholder="https://example.com"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              startIcon={<Globe className="h-4 w-4" />}
            />
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              startIcon={<DollarSign className="h-4 w-4" />}
            />
            <Input
              label="Search"
              type="search"
              placeholder="Search anything..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              startIcon={<Search className="h-4 w-4" />}
              endIcon={
                searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    className="text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )
              }
            />
            <Input label="Location" placeholder="City, Country" startIcon={<MapPin className="h-4 w-4" />} helperText="Enter your current location" />
          </div>
        </CardContent>
      </Card>

      {/* Input States */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleCheck className="h-5 w-5 text-primary" />
            Input States
          </CardTitle>
          <CardDescription>Disabled, error, success, and loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Disabled Input" placeholder="Cannot edit this" value="Fixed value" disabled startIcon={<Lock className="h-4 w-4" />} />
            <Input label="Read Only" placeholder="Read only value" value="user@example.com" readOnly startIcon={<Mail className="h-4 w-4" />} />
            <Input
              label="With Error"
              placeholder="Enter email"
              value="invalid-email"
              error="Please enter a valid email address"
              startIcon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="With Helper Text"
              placeholder="Enter username"
              helperText="Username must be 3-20 characters"
              startIcon={<AtSign className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Textarea */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Textarea
          </CardTitle>
          <CardDescription>Multi-line text input fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea
              label="Message"
              placeholder="Enter your message here..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={4}
              helperText={`${textareaValue.length}/500 characters`}
            />
            <Textarea label="Bio" placeholder="Tell us about yourself..." value={bioValue} onChange={(e) => setBioValue(e.target.value)} rows={4} />
            <Textarea label="Disabled Textarea" placeholder="Cannot edit" value="This textarea is disabled" disabled rows={3} />
            <Textarea label="With Error" placeholder="Enter description" error="Description is required" rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Select Dropdowns */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronDown className="h-5 w-5 text-primary" />
            Select Dropdowns
          </CardTitle>
          <CardDescription>Single selection dropdown menus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Country"
              placeholder="Select a country"
              options={countryOptions}
              value={selectedCountry}
              onChange={setSelectedCountry}
              searchable
            />
            <Select
              label="Priority"
              placeholder="Select priority"
              options={priorityOptions}
              value={selectedPriority}
              onChange={setSelectedPriority}
            />
            <Select
              label="Category"
              placeholder="Choose category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              helperText="Select a category for your inquiry"
            />
            <Select label="Disabled Select" placeholder="Cannot select" options={priorityOptions} disabled />
            <Select label="With Error" placeholder="Required field" options={categoryOptions} error="Please select an option" />
            <Select
              label="Searchable"
              placeholder="Type to search..."
              options={countryOptions}
              searchable
              helperText="Start typing to filter options"
            />
          </div>

          {/* Selected Values Display */}
          {(selectedCountry || selectedPriority || selectedCategory) && (
            <div className="p-4 bg-surface-container rounded-xl">
              <h4 className="text-sm font-medium text-on-surface mb-2">Selected Values:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCountry && <Badge variant="default">Country: {countryOptions.find((o) => o.value === selectedCountry)?.label}</Badge>}
                {selectedPriority && <Badge variant="secondary">Priority: {priorityOptions.find((o) => o.value === selectedPriority)?.label}</Badge>}
                {selectedCategory && <Badge variant="outline">Category: {categoryOptions.find((o) => o.value === selectedCategory)?.label}</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Radio Buttons */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleCheck className="h-5 w-5 text-primary" />
            Radio Buttons
          </CardTitle>
          <CardDescription>Single selection from multiple options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vertical Radio Group */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-on-surface">Subscription Plan (Vertical)</h3>
            <RadioGroup name="plan" value={selectedPlan} onChange={setSelectedPlan} orientation="vertical">
              <Radio value="free" label="Free" description="Basic features for personal use" />
              <Radio value="pro" label="Pro" description="Advanced features for professionals" />
              <Radio value="enterprise" label="Enterprise" description="Full access for teams" />
            </RadioGroup>
          </div>

          {/* Horizontal Radio Group */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-on-surface">Size (Horizontal)</h3>
            <RadioGroup name="size" value={selectedSize} onChange={setSelectedSize} orientation="horizontal">
              <Radio value="small" label="Small" />
              <Radio value="medium" label="Medium" />
              <Radio value="large" label="Large" />
              <Radio value="xl" label="Extra Large" />
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-on-surface">Payment Method</h3>
            <RadioGroup name="payment" value={selectedPayment} onChange={setSelectedPayment} orientation="vertical">
              <Radio value="card" label="Credit Card" description="Pay with Visa, Mastercard, or American Express" />
              <Radio value="paypal" label="PayPal" description="Pay securely with your PayPal account" />
              <Radio value="bank" label="Bank Transfer" description="Direct bank transfer (3-5 business days)" />
            </RadioGroup>
          </div>

          {/* Disabled Radio */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-on-surface">Disabled Options</h3>
            <div className="flex gap-4">
              <Radio name="disabled" value="enabled" label="Enabled" />
              <Radio name="disabled" value="disabled" label="Disabled" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkboxes */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Checkboxes
          </CardTitle>
          <CardDescription>Multiple selection toggle controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Basic Checkboxes */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-on-surface">Preferences</h3>
              <div className="space-y-2">
                <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} label="Accept terms and conditions" />
                <Checkbox
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  label="Email notifications"
                  description="Receive updates about your account"
                />
                <Checkbox
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  label="Dark mode preference"
                  description="Enable dark theme by default"
                />
              </div>
            </div>

            {/* States */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-on-surface">States</h3>
              <div className="space-y-2">
                <Checkbox label="Unchecked" />
                <Checkbox checked label="Checked" onChange={() => {}} />
                <Checkbox disabled label="Disabled unchecked" />
                <Checkbox disabled checked label="Disabled checked" onChange={() => {}} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Switches */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Switches
          </CardTitle>
          <CardDescription>Toggle switches for on/off states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Functional Switches */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-on-surface">Settings</h3>
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                label="Push Notifications"
                description="Receive push notifications on your device"
              />
              <Switch
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                label="Auto-save"
                description="Automatically save changes as you work"
              />
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                label="Dark Mode"
                description="Use dark theme throughout the app"
              />
            </div>

            {/* States and Sizes */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-on-surface">States & Sizes</h3>
              <Switch label="Default size" checked onChange={() => {}} />
              <Switch label="Small size" size="sm" checked onChange={() => {}} />
              <Switch label="Disabled on" disabled checked onChange={() => {}} />
              <Switch label="Disabled off" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Pickers */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Date Pickers
          </CardTitle>
          <CardDescription>Date selection components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker label="Single Date" value={singleDate} onChange={setSingleDate} placeholder="Select a date" helperText="Choose any date" />
            <DatePicker
              label="With Constraints"
              placeholder="December 2025 only"
              minDate="2025-12-01"
              maxDate="2025-12-31"
              helperText="Only December 2025 dates allowed"
              onChange={() => {}}
            />
            <DatePicker label="Disabled" value="2025-12-25" onChange={() => {}} disabled />
            <DatePicker label="With Error" placeholder="Required" error="Please select a date" onChange={() => {}} />
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-on-surface">Date Range Picker</h3>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-on-surface-variant">Filter by date:</span>
              <DateRangePicker
                fromDate={fromDate}
                toDate={toDate}
                onChange={(from, to) => {
                  setFromDate(from);
                  setToDate(to);
                }}
                showPresets
              />
            </div>
            {fromDate && (
              <p className="text-sm text-on-surface-variant">
                Selected range: <span className="font-medium text-on-surface">{fromDate}</span>
                {toDate && toDate !== fromDate && (
                  <>
                    {' '}
                    → <span className="font-medium text-on-surface">{toDate}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Pickers */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Time Pickers
          </CardTitle>
          <CardDescription>M3 Expressive time selection with dial and keyboard modes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TimePicker
              label="Select Time"
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="Choose a time"
              helperText="Click to open time picker"
            />
            <TimePicker label="24-Hour Format" value={selectedTime} onChange={setSelectedTime} use24Hour helperText="Displays in 24-hour format" />
            <TimePicker label="Disabled" value="14:30" onChange={() => {}} disabled />
            <TimePicker label="With Error" placeholder="Required" error="Please select a time" onChange={() => {}} />
          </div>
          {selectedTime && (
            <p className="text-sm text-on-surface-variant">
              Selected time: <span className="font-medium text-on-surface">{selectedTime}</span> (24h format)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Example */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Complete Form Example
          </CardTitle>
          <CardDescription>A realistic form combining various input types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First Name" placeholder="John" startIcon={<User className="h-4 w-4" />} />
            <Input label="Last Name" placeholder="Doe" startIcon={<User className="h-4 w-4" />} />
            <Input label="Email" type="email" placeholder="john.doe@example.com" startIcon={<Mail className="h-4 w-4" />} className="sm:col-span-2" />
            <Select label="Country" placeholder="Select your country" options={countryOptions} searchable />
            <Select label="Topic" placeholder="What is this about?" options={categoryOptions} />
          </div>
          <Textarea label="Message" placeholder="How can we help you?" rows={4} />
          <div className="space-y-3">
            <Checkbox label="I agree to the terms of service and privacy policy" />
            <Switch label="Subscribe to newsletter" description="Receive occasional updates and tips" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="filled">Submit</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

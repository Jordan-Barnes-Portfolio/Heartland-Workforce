import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  User,
  Shield,
  Palette,
  Globe,
  Mail,
  Moon,
  Sun,
} from 'lucide-react';

export function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // User settings state
  const [settings, setSettings] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      updates: false,
    },
    privacy: {
      shareData: true,
      analytics: true,
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account settings and preferences
              </p>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your personal information and email settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          value={settings.firstName}
                          onChange={(e) =>
                            setSettings({ ...settings, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          value={settings.lastName}
                          onChange={(e) =>
                            setSettings({ ...settings, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) =>
                          setSettings({ ...settings, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) =>
                          setSettings({ ...settings, language: value })
                        }
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              email: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              push: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Product Updates</Label>
                        <p className="text-sm text-gray-500">
                          Receive updates about new features and improvements
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.updates}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              updates: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how the application looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Button
                          variant={settings.theme === 'light' ? 'default' : 'outline'}
                          className="w-full justify-start gap-2"
                          onClick={() => setSettings({ ...settings, theme: 'light' })}
                        >
                          <Sun className="h-4 w-4" />
                          Light
                        </Button>
                        <Button
                          variant={settings.theme === 'dark' ? 'default' : 'outline'}
                          className="w-full justify-start gap-2"
                          onClick={() => setSettings({ ...settings, theme: 'dark' })}
                        >
                          <Moon className="h-4 w-4" />
                          Dark
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Manage your privacy and data sharing preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-gray-500">
                          Allow sharing of anonymous usage data
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.shareData}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              shareData: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Analytics</Label>
                        <p className="text-sm text-gray-500">
                          Enable analytics to help improve our services
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            privacy: {
                              ...settings.privacy,
                              analytics: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

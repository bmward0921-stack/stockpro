import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertCircle, CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login, signup, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const error = localError || authError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    clearError();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    clearError();

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await signup(email, password, name);
    
    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.error || 'Signup failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-info/20 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-success/10 blur-3xl" style={{ animationDelay: '2s' }} />
        
        {/* Floating particles */}
        <div className="absolute left-[10%] top-[20%] h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDuration: '3s' }} />
        <div className="absolute left-[80%] top-[30%] h-3 w-3 animate-bounce rounded-full bg-info/40" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
        <div className="absolute left-[20%] top-[70%] h-2 w-2 animate-bounce rounded-full bg-success/40" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
        <div className="absolute left-[70%] top-[80%] h-3 w-3 animate-bounce rounded-full bg-primary/40" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
      </div>

      {/* Main popup card */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Glass morphism card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl">
          {/* Inner glow border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-info/20 opacity-50" />
          
          {/* Content container */}
          <div className="relative rounded-[22px] bg-background/95 p-6 sm:p-8">
            {/* Close button (decorative) */}
            <button 
              onClick={() => navigate('/')} 
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with logo and sparkles */}
            <div className="mb-8 text-center">
              <div className="relative mx-auto mb-4 inline-flex">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
                  <Package className="h-10 w-10 text-primary-foreground" />
                </div>
                <Sparkles className="absolute -right-2 -top-2 h-6 w-6 animate-pulse text-info" />
              </div>
              <h1 className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                StockSync
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage your multi-platform listings
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 rounded-xl border-border/50 bg-muted/30 transition-all focus:border-primary focus:bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 rounded-xl border-border/50 bg-muted/30 transition-all focus:border-primary focus:bg-background"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="group h-11 w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 font-medium shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign in
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Name (optional)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="h-11 rounded-xl border-border/50 bg-muted/30 transition-all focus:border-primary focus:bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 rounded-xl border-border/50 bg-muted/30 transition-all focus:border-primary focus:bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-11 rounded-xl border-border/50 bg-muted/30 transition-all focus:border-primary focus:bg-background"
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="group h-11 w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 font-medium shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create account
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Access limited to authorized team members.
                <br />
                <span className="text-muted-foreground/70">Contact admin for access.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

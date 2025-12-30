import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  });

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setLoading(false);
    if (error) {
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account Created', description: 'You can now sign in.' });
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setLoading(true);
    const { error } = await resetPassword(data.email);
    setLoading(false);
    if (error) {
      toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
    } else {
      setResetEmailSent(true);
      toast({ 
        title: 'Reset Email Sent', 
        description: 'Check your email for a password reset link.' 
      });
    }
  };

  const getTitle = () => {
    if (view === 'forgot-password') return 'Reset Password';
    return view === 'login' ? 'Welcome Back' : 'Create Account';
  };

  const getSubtitle = () => {
    if (view === 'forgot-password') return "Enter your email and we'll send you a reset link";
    return view === 'login' ? 'Sign in to access the admin portal' : 'Register as a hospital admin';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-white">
          <Logo size="lg" className="mb-8 [&_span]:text-white [&_.text-muted-foreground]:text-white/70" />
          <h1 className="text-4xl font-bold mb-4">Save Lives, One Drop at a Time</h1>
          <p className="text-white/80 text-lg">
            Hospital Vital Voice Admin Portal for managing blood requests and connecting with donors across the network.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <div className="blood-card p-8">
            {view === 'forgot-password' && (
              <button
                type="button"
                onClick={() => { setView('login'); setResetEmailSent(false); }}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </button>
            )}
            
            <h2 className="text-2xl font-bold mb-2">{getTitle()}</h2>
            <p className="text-muted-foreground mb-6">{getSubtitle()}</p>

            {view === 'forgot-password' ? (
              resetEmailSent ? (
                <div className="text-center py-4">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    We've sent a password reset link to your email. Please check your inbox and follow the instructions.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => { setView('login'); setResetEmailSent(false); }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input {...forgotPasswordForm.register('email')} className="pl-10" placeholder="admin@hospital.com" />
                    </div>
                    {forgotPasswordForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{forgotPasswordForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full medical-gradient" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                </form>
              )
            ) : view === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input {...loginForm.register('email')} className="pl-10" placeholder="admin@hospital.com" />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input {...loginForm.register('password')} type="password" className="pl-10" placeholder="••••••••" />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full medical-gradient" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input {...signupForm.register('fullName')} className="pl-10" placeholder="Dr. John Doe" />
                  </div>
                  {signupForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input {...signupForm.register('email')} className="pl-10" placeholder="admin@hospital.com" />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input {...signupForm.register('password')} type="password" className="pl-10" placeholder="••••••••" />
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full medical-gradient" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            )}

            {view !== 'forgot-password' && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                  className="text-sm text-primary hover:underline"
                >
                  {view === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { loginSchema, registerSchema } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Fingerprint, Facebook, Github, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthSafe } from '@/hooks/use-auth-safe';
import { Separator } from '@/components/ui/separator';

type AuthMode = 'login' | 'register';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState<boolean>(false);
  const [redirectReason, setRedirectReason] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const location = useLocation();
  const { user, loginMutation, registerMutation } = useAuthSafe();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  // Check for URL parameters that indicate a redirect reason
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    if (reason) {
      setRedirectReason(reason);
    }
    
    // Simulate biometric capability check
    // In a real app, this would check for actual device capabilities
    const checkBiometricCapability = () => {
      // Mock check - would be implemented with actual device capability detection
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsBiometricAvailable(isMobile);
    };
    
    checkBiometricCapability();
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // If user is admin, redirect to admin dashboard
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);
  
  if (user) return null; // Don't render anything while redirecting
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });
  
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await loginMutation.mutateAsync(values);
      // Redirect is handled in the useEffect
    } catch (error) {
      // Error is handled by the mutation
    }
  };
  
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await registerMutation.mutateAsync(values);
      // Redirect is handled in the useEffect
    } catch (error) {
      // Error is handled by the mutation
    }
  };
  
  const handleSocialLogin = (provider: string) => {
    // In a real implementation, this would redirect to OAuth provider
    alert(`${provider} login would be implemented with actual OAuth integration`);
  };
  
  const handleBiometricLogin = () => {
    // In a real implementation, this would trigger device biometric authentication
    alert('Biometric authentication would be implemented with actual device APIs');
  };
  
  // Social login buttons
  const SocialLoginButtons = () => (
    <motion.div 
      className="grid grid-cols-2 gap-3 mt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 hover:bg-opacity-10 hover:bg-blue-500 transition-all"
          onClick={() => handleSocialLogin('Google')}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.188-2.707-6.735-2.707-5.523 0-10 4.477-10 10s4.477 10 10 10c8.369 0 10.259-7.839 9.449-11.661h-9.449z" />
          </svg>
          Google
        </Button>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 hover:bg-opacity-10 hover:bg-blue-600 transition-all"
          onClick={() => handleSocialLogin('Facebook')}
        >
          <Facebook className="w-5 h-5" />
          Facebook
        </Button>
      </motion.div>
    </motion.div>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Form Column */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                <div className="mb-8">
                  <h1 className="font-space font-bold text-3xl md:text-4xl text-white mb-2">
                    {t('auth.welcome_to', 'Welcome to')} <span className="text-electric-blue">LUX</span>
                  </h1>
                  <p className="text-muted-gray">
                    {t('auth.access_account', 'Access your account or create a new one to explore our premium furniture collection.')}
                  </p>
                </div>
                
                {/* Show redirect reason if present */}
                {redirectReason && (
                  <motion.div 
                    className="mb-6 p-4 rounded-lg bg-blue-950/50 border border-blue-800"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-blue-200">
                      {redirectReason === 'ar' ? (
                        t('auth.ar_redirect', 'Sign in to unlock AR viewing and try products in your space!')
                      ) : (
                        t('auth.feature_redirect', 'Sign in to access this premium feature!')
                      )}
                    </p>
                  </motion.div>
                )}
                
                <div className="p-6 rounded-xl bg-dark-gray border border-gray-800 shadow-glow-sm">
                  <Tabs 
                    defaultValue="login" 
                    onValueChange={(value) => setMode(value as AuthMode)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login" className="data-[state=active]:shadow-glow-blue">
                        <span className="flex items-center gap-1.5">
                          <LogIn className="w-4 h-4" />
                          {t('auth.login', 'Login')}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="register" className="data-[state=active]:shadow-glow-purple">
                        <span className="flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4" />
                          {t('auth.register', 'Register')}
                        </span>
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Login Tab */}
                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                          >
                            <motion.div variants={itemVariants}>
                              <FormField
                                control={loginForm.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('auth.username', 'Username')}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder={t('auth.enter_username', 'Enter your username')}
                                        className="focus:border-electric-blue focus:shadow-glow-blue transition-all"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <FormField
                                control={loginForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('auth.password', 'Password')}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="password" 
                                        placeholder={t('auth.enter_password', 'Enter your password')}
                                        className="focus:border-electric-blue focus:shadow-glow-blue transition-all"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="remember" />
                                <label htmlFor="remember" className="text-sm text-muted-gray cursor-pointer">
                                  {t('auth.remember_me', 'Remember me')}
                                </label>
                              </div>
                              <a href="#" className="text-sm text-electric-blue hover:text-blue-400 transition-colors">
                                {t('auth.forgot_password', 'Forgot password?')}
                              </a>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <Button 
                                type="submit" 
                                className="w-full font-space bg-gradient-to-r from-electric-blue to-vivid-purple hover:shadow-glow-blue transition-all"
                                disabled={loginMutation.isPending}
                              >
                                {loginMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {t('auth.sign_in', 'Sign In')}
                              </Button>
                            </motion.div>
                            
                            {/* Biometric login for mobile */}
                            {isBiometricAvailable && (
                              <motion.div variants={itemVariants} className="flex justify-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="flex items-center gap-2 hover:text-electric-blue transition-colors"
                                  onClick={handleBiometricLogin}
                                >
                                  <Fingerprint className="w-5 h-5" />
                                  {t('auth.biometric_login', 'Login with Biometrics')}
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        </form>
                      </Form>
                      
                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-dark-gray px-2 text-xs text-muted-gray">
                            {t('auth.or_continue_with', 'Or continue with')}
                          </span>
                        </div>
                      </div>
                      
                      <SocialLoginButtons />
                    </TabsContent>
                    
                    {/* Register Tab */}
                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                          >
                            <motion.div variants={itemVariants}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={registerForm.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('auth.first_name', 'First Name')}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('auth.first_name_placeholder', 'John')}
                                          className="focus:border-vivid-purple focus:shadow-glow-purple transition-all"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="lastName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('auth.last_name', 'Last Name')}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('auth.last_name_placeholder', 'Doe')}
                                          className="focus:border-vivid-purple focus:shadow-glow-purple transition-all"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <FormField
                                control={registerForm.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('auth.username', 'Username')}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder={t('auth.choose_username', 'Choose a username')}
                                        className="focus:border-vivid-purple focus:shadow-glow-purple transition-all"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <FormField
                                control={registerForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('auth.email', 'Email')}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="email" 
                                        placeholder={t('auth.email_placeholder', 'your@email.com')}
                                        className="focus:border-vivid-purple focus:shadow-glow-purple transition-all"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <FormField
                                control={registerForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('auth.password', 'Password')}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="password" 
                                        placeholder={t('auth.create_password', 'Create a password')}
                                        className="focus:border-vivid-purple focus:shadow-glow-purple transition-all"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <FormField
                                control={registerForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('auth.confirm_password', 'Confirm Password')}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="password" 
                                        placeholder={t('auth.confirm_password_placeholder', 'Confirm your password')}
                                        className="focus:border-vivid-purple focus:shadow-glow-purple transition-all"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <div className="flex items-center space-x-2 mb-4">
                                <Checkbox id="terms" />
                                <label htmlFor="terms" className="text-sm text-muted-gray cursor-pointer">
                                  {t('auth.agree_terms', 'I agree to the Terms of Service and Privacy Policy')}
                                </label>
                              </div>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                              <Button 
                                type="submit" 
                                className="w-full font-space bg-gradient-to-r from-electric-blue to-vivid-purple hover:shadow-glow-purple transition-all"
                                disabled={registerMutation.isPending}
                              >
                                {registerMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {t('auth.create_account', 'Create Account')}
                              </Button>
                            </motion.div>
                          </motion.div>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            </div>
            
            {/* Hero Column */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-xl aspect-square max-w-md mx-auto shadow-glow-lg">
                {/* Background pattern */}
                <div className="absolute inset-0 hex-pattern circuit-lines opacity-30"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-rich-black/80 to-transparent backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-electric-blue to-vivid-purple flex items-center justify-center animate-pulse-slow mb-6 shadow-glow-md">
                    <span className="font-syncopate font-bold text-3xl text-white">LUX</span>
                  </div>
                  
                  <h2 className="font-space font-bold text-3xl text-white mb-4">
                    {t('auth.hero_title', 'Elevate Your Space')}
                  </h2>
                  
                  <p className="text-muted-gray mb-6">
                    {t('auth.hero_description', 'Join our community of design enthusiasts and transform your home with our cutting-edge furniture solutions.')}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="p-4 rounded-lg bg-dark-gray border border-gray-800 flex flex-col items-center hover:shadow-glow-sm transition-all">
                      <span className="text-2xl font-bold text-electric-blue">350+</span>
                      <span className="text-xs text-muted-gray">{t('auth.products', 'Products')}</span>
                    </div>
                    <div className="p-4 rounded-lg bg-dark-gray border border-gray-800 flex flex-col items-center hover:shadow-glow-sm transition-all">
                      <span className="text-2xl font-bold text-vivid-purple">20k+</span>
                      <span className="text-xs text-muted-gray">{t('auth.customers', 'Happy Customers')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 w-full">
                    <motion.div 
                      className="group relative overflow-hidden rounded-lg p-1 bg-gradient-to-r from-electric-blue to-vivid-purple w-full"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="bg-rich-black rounded-md p-3 flex items-center justify-center relative">
                        <span className="text-white font-medium">
                          {t('auth.try_ar_feature', 'Sign In to Try AR Features')}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthPage;

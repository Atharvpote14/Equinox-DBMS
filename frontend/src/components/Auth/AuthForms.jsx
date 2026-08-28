import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Form, FormRow } from '../UI/Form';

export function LoginForm({ onTabChange }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const email = formData.get('email');
      const password = formData.get('password');
      await login(email, password);
      showToast('Welcome back', 'You are now connected to the Equinox command center.', 'success');
    } catch (err) {
      setError(err.message);
      showToast('Login failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} id="login-form">
      <Input
        label="Email address"
        type="email"
        name="email"
        placeholder="citizen@equinox.app"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        required
      />
      {error && <div className="inline-message" style={{ color: 'var(--danger)' }}>{error}</div>}
      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Signing in...' : 'Enter Command Center'}
      </Button>
    </Form>
  );
}

export function RegisterForm({ onTabChange }) {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone_number: formData.get('phone_number'),
        date_of_birth: formData.get('date_of_birth'),
        location_city: formData.get('location_city'),
      };
      await register(payload);
      showToast('Citizen profile created', 'You can now sign in to continue.', 'success');
      onTabChange('login');
    } catch (err) {
      setError(err.message);
      showToast('Registration failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} id="register-form">
      <Input
        label="Full name"
        name="full_name"
        placeholder="Sai Santosh Randive"
        required
      />
      <Input
        label="Email address"
        type="email"
        name="email"
        placeholder="citizen@equinox.app"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Use at least 6 characters"
        required
      />
      <FormRow>
        <Input
          label="Phone number"
          name="phone_number"
          placeholder="9876543210"
        />
        <Input
          label="Date of birth"
          type="date"
          name="date_of_birth"
          required
        />
      </FormRow>
      <Input
        label="City"
        name="location_city"
        placeholder="Pune"
      />
      {error && <div className="inline-message" style={{ color: 'var(--danger)' }}>{error}</div>}
      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Creating...' : 'Create Citizen Profile'}
      </Button>
    </Form>
  );
}
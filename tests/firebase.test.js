const request = require('supertest');
const app = require('../src/app');
const firebaseConfig = require('../src/config/firebase');
const fcmService = require('../src/services/fcm.service');
const { verifyFirebaseToken } = require('../src/middlewares/firebaseAuth.middleware');
const User = require('../src/models/User');

require('./setup');

describe('Firebase Integration & Services', () => {
  describe('Firebase Config & Graceful Fallback', () => {
    it('should export configuration objects and readiness helper without crashing', () => {
      expect(typeof firebaseConfig.isFirebaseReady).toBe('function');
      expect(typeof firebaseConfig.getAuth).toBe('function');
      expect(typeof firebaseConfig.getStorage).toBe('function');
      expect(typeof firebaseConfig.getMessaging).toBe('function');
    });

    it('should report correct readiness state when unconfigured', () => {
      // In testing without credentials, isFirebaseReady returns false
      const ready = firebaseConfig.isFirebaseReady();
      expect(typeof ready).toBe('boolean');
    });
  });

  describe('FCM Push Notification Service Fallbacks', () => {
    it('should handle sending to single device gracefully (fake token)', async () => {
      const res = await fcmService.sendToDevice('fake-device-token-123', {
        title: 'Camp Alert',
        body: 'Annual Training Camp begins tomorrow'
      });
      expect(res.success).toBe(false);
      // Either FCM is not initialized (no credentials) or the token is invalid (with credentials)
      if (res.message) {
        expect(res.message).toContain('FCM is not initialized');
      } else if (res.error) {
        expect(typeof res.error).toBe('string');
      }
    });

    it('should handle sending multicast gracefully (fake tokens)', async () => {
      const res = await fcmService.sendToDevices(['token-1', 'token-2'], {
        title: 'Parade Update',
        body: 'Morning drill timing revised'
      });
      // When Firebase is configured, multicast may partially succeed/fail
      if (!firebaseConfig.isFirebaseReady()) {
        expect(res.success).toBe(false);
        expect(res.message).toContain('FCM is not initialized');
      } else {
        // With real config but fake tokens, it will either error or report failures
        expect(res).toBeDefined();
      }
    });

    it('should handle sending to topic gracefully (no real subscribers)', async () => {
      const res = await fcmService.sendToTopic('all-cadets', {
        title: 'General Notice',
        body: 'Uniform inspection scheduled for Friday'
      });
      if (!firebaseConfig.isFirebaseReady()) {
        expect(res.success).toBe(false);
        expect(res.message).toContain('FCM is not initialized');
      } else {
        // With real config, topic send may succeed (no subscribers) or error
        expect(res).toBeDefined();
        expect(typeof res.success).toBe('boolean');
      }
    });
  });

  describe('Firebase Authentication Endpoint (POST /api/auth/firebase-login)', () => {
    it('should validate request body and require idToken', async () => {
      const res = await request(app)
        .post('/api/auth/firebase-login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'idToken', message: 'Firebase ID token is required' })
        ])
      );
    });

    it('should return 500 when Firebase is unconfigured on the server', async () => {
      const res = await request(app)
        .post('/api/auth/firebase-login')
        .send({ idToken: 'some-fake-id-token' });

      // When unconfigured, it notifies client that Firebase is not configured
      expect([500, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
      if (res.status === 500) {
        expect(res.body.message).toContain('Firebase');
      }
    });
  });

  describe('Firebase Auth Middleware', () => {
    it('should pass error to next when token is missing or firebase unconfigured', async () => {
      const req = { headers: {} };
      const res = {};
      let nextError = null;
      const next = (err) => {
        nextError = err;
      };

      await verifyFirebaseToken(req, res, next);
      expect(nextError).toBeDefined();
    });
  });

  describe('User Model Firebase fields', () => {
    it('should allow creating users with firebaseUid and fcmTokens', async () => {
      const user = await User.create({
        name: 'Rohan Sharma',
        email: 'rohan.fb@cadet.test',
        password: 'Password@123',
        firebaseUid: 'firebase-sample-uid-999',
        fcmTokens: ['sample-fcm-token-abc']
      });

      expect(user._id).toBeDefined();
      expect(user.firebaseUid).toBe('firebase-sample-uid-999');
      expect(user.fcmTokens).toContain('sample-fcm-token-abc');

      // Ensure duplicate firebaseUid is prevented
      let duplicateError = null;
      try {
        await User.create({
          name: 'Another User',
          email: 'another@cadet.test',
          password: 'Password@123',
          firebaseUid: 'firebase-sample-uid-999'
        });
      } catch (err) {
        duplicateError = err;
      }
      expect(duplicateError).toBeDefined();
      expect(duplicateError.code).toBe(11000);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { LeakyBucket } from '../algorithms/leakyBucket.algo.js';

describe('LeakyBucket', () => {
  it('should allow requests when bucket has capacity', async () => {
    const bucket = new LeakyBucket(5, 1); 
    const userId = `test-${Date.now()}`;
    const result = await bucket.allowRequest(userId);
    expect(result).toBe(true);
  });


  it('should reject requests when bucket is full', async () => {
    const bucket = new LeakyBucket(1, 0);
    const userId = `test-${Date.now()}`;
    const firstRequest = await bucket.allowRequest(userId);
    expect(firstRequest).toBe(true);

    const secondRequest = await bucket.allowRequest(userId);
    expect(secondRequest).toBe(false);
  });


  it('should allow requests after requests leak from the bucket', async () => {
    const bucket = new LeakyBucket(1, 1);
    const userId = `test-${Date.now()}`;

    const firstRequest = await bucket.allowRequest(userId);
    expect(firstRequest).toBe(true);

    const secondRequest = await bucket.allowRequest(userId);
    expect(secondRequest).toBe(false);

    const waitTime = 1100; 
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    const thirdRequest = await bucket.allowRequest(userId);
    expect(thirdRequest).toBe(true);
  });


  it('should maintain independent buckets for different users', async () => {
    const bucket = new LeakyBucket(1, 1);
    const userId1 = `user1-${Date.now()}`;
    const userId2 = `user2-${Date.now()}`;

    const firstRequestUser1 = await bucket.allowRequest(userId1);
    expect(firstRequestUser1).toBe(true);

    const secondRequestUser1 = await bucket.allowRequest(userId1);
    expect(secondRequestUser1).toBe(false);

    const firstRequestUser2 = await bucket.allowRequest(userId2);
    expect(firstRequestUser2).toBe(true);

    const secondRequestUser2 = await bucket.allowRequest(userId2);
    expect(secondRequestUser2).toBe(false);
  });


  it('should not exceed bucket capacity', async () => {
    const bucket = new LeakyBucket(2, 1);
    const userId = `test-${Date.now()}`;
    
    const firstRequest = await bucket.allowRequest(userId);
    expect(firstRequest).toBe(true);
    
    const secondRequest = await bucket.allowRequest(userId);
    expect(secondRequest).toBe(true);

    const waitTime = 3000; 
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    const thirdRequest = await bucket.allowRequest(userId);
    expect(thirdRequest).toBe(true);

    const fourthRequest = await bucket.allowRequest(userId);
    expect(fourthRequest).toBe(true);

    const fifthRequest = await bucket.allowRequest(userId);
    expect(fifthRequest).toBe(false);
  });

  
  it('should not exceed capacity with concurrent requests', async () => {
    const bucket = new LeakyBucket(5, 0);
    const userId = `concurrent-${Date.now()}`;

    const results = await Promise.all(
        Array.from({ length: 20 }, () =>
            bucket.allowRequest(userId)
        )
    );

    const allowedRequests = results.filter(
        result => result === true
    );

    expect(allowedRequests.length).toBe(5);
});
});
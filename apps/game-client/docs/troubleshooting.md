# Troubleshooting

## First-Person Control Issues

### WASD Movement Problems

#### Issue: Inverted WASD Controls and Movement Delay

**Symptoms:**
- W and S keys appear to move in the wrong direction (inverted)
- A and D keys appear to move in the wrong direction (inverted) 
- There is a lag or delay when stopping movement after releasing keys

**Causes:**
1. Incorrect angle calculations in the movement code
2. Movement direction not properly aligned with camera facing direction
3. Server notification delay when stopping movement
4. Movement calculations not considering player's orientation properly

**Solutions Implemented:**

1. **Fixed movement direction calculations:**
   - Ensured that W moves the player in the direction the camera is facing
   - Ensured that S moves the player in the opposite direction
   - Ensured that A and D strafe properly relative to the player's facing direction

2. **Improved movement stopping:**
   - Added immediate server notifications when keys are released
   - Restructured key-up handling to immediately stop movement
   - Added proper debug logging for troubleshooting

3. **Improved movement direction clarity:**
   - Added detailed logging to track movement calculations
   - Clarified the relationship between camera angle and movement direction

**Technical Details:**

The movement in first-person mode uses trigonometric functions to calculate velocity:
- Forward/backward movement: 
  ```
  vertical = Math.cos(cameraAngle) * rawVertical
  horizontal = Math.sin(cameraAngle) * rawVertical
  ```

- Strafe movement (perpendicular to camera direction):
  ```
  vertical += Math.cos(cameraAngle + Math.PI/2) * rawHorizontal
  horizontal += Math.sin(cameraAngle + Math.PI/2) * rawHorizontal
  ```

When debugging movement issues, check:
1. The `deltaCamY` value (should match player's rotation)
2. The key input values (W=1, S=-1, A=-1, D=1)
3. The calculated velocity values after applying trigonometric functions 
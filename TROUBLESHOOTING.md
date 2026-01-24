# Troubleshooting "Failed to download remote update" Error

## Quick Fixes (Try These First)

### 1. Wait for Metro Bundler to Finish
The bundler needs 1-2 minutes to build the app. Look for this message in the terminal:
```
Metro waiting on exp://192.168.x.x:8081
```
Only scan the QR code AFTER you see this message.

### 2. Check Network Connection
- **CRITICAL**: Your phone and computer MUST be on the same Wi-Fi network
- Make sure both devices are connected to the same router
- Try disconnecting and reconnecting your phone's Wi-Fi

### 3. Check Windows Firewall
Windows Firewall might be blocking the connection:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Firewall"
3. Find "Node.js" and make sure both Private and Public are checked
4. If Node.js isn't listed, click "Allow another app" and add it

### 4. Use Tunnel Mode (If LAN Doesn't Work)
If you're still having issues, try tunnel mode:
```bash
npx expo start --tunnel
```
Note: This requires installing @expo/ngrok globally:
```bash
npm install -g @expo/ngrok
```

### 5. Try Manual Connection
Instead of scanning QR code:
1. In Expo Go app, tap "Enter URL manually"
2. Type the URL shown in terminal (e.g., `exp://192.168.1.100:8081`)
3. Make sure to use your computer's local IP address

### 6. Clear Expo Go Cache
On your phone:
1. Open Expo Go app
2. Go to Settings
3. Clear cache/data
4. Try scanning QR code again

### 7. Check IP Address
Make sure the IP in the QR code matches your computer's IP:
- Windows: Open Command Prompt and type `ipconfig`
- Look for "IPv4 Address" under your Wi-Fi adapter
- The IP in Expo should match this

## Common Issues

### Issue: "Metro bundler is still building"
**Solution**: Wait 1-2 minutes for the initial build to complete. You'll see "Metro waiting on..." when ready.

### Issue: Phone and computer on different networks
**Solution**: Connect both to the same Wi-Fi network. Mobile data won't work.

### Issue: Firewall blocking connection
**Solution**: Allow Node.js through Windows Firewall (see step 3 above).

### Issue: Antivirus blocking connection
**Solution**: Temporarily disable antivirus or add Node.js to exceptions.

### Issue: Corporate/school network restrictions
**Solution**: Use tunnel mode (`--tunnel` flag) which routes through Expo's servers.

## Still Not Working?

1. **Restart everything**:
   - Stop the dev server (Ctrl+C)
   - Close Expo Go app completely
   - Restart dev server: `npx expo start --clear`
   - Reopen Expo Go and scan QR code

2. **Check terminal for errors**: Look for any red error messages in the terminal

3. **Try a different device**: Test on an emulator/simulator to rule out phone-specific issues

4. **Check Expo Go version**: Make sure you have the latest version of Expo Go installed

## Testing on Emulator/Simulator

If testing on an emulator instead of a physical device:
- **Android**: Press `a` in the terminal
- **iOS**: Press `i` in the terminal
- This bypasses network issues entirely

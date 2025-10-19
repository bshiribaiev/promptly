# Restart Backend to Apply WebSocket Fix

## The Fix

- Changed from `Mono.zip()` to `session.send().and()` to properly coordinate inbound/outbound streams
- The WebSocket will now stay open and process audio chunks correctly

## Restart Steps

1. **Stop the current backend** (Ctrl+C in the terminal running it)

2. **Restart with env vars**:

```bash
cd "/Users/shiribaiev/Library/CloudStorage/GoogleDrive-bekbolnyc@gmail.com/My Drive/hack-knights/backend"
export STT_PROVIDER=elevenlabs
export ELEVENLABS_API_KEY=your_actual_key
./gradlew bootRun
```

3. **Test the frontend** at http://localhost:3000

   - Click "Voice Input"
   - You should now see in browser console:
     - "WebSocket connected"
     - "WebSocket ready to receive audio"
   - Speak, then click "Stop Recording"
   - Transcript should appear

4. **Watch backend logs** for detailed info:
   - "WebSocket connection established"
   - "Writing N bytes to temp file" (for each chunk)
   - "Received text message: end"
   - "Transcribing audio file"
   - "Transcription result: ..."

## If Still Failing

Check backend logs for specific error messages and share them.

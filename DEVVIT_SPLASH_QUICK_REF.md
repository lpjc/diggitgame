# Devvit Splash Screen - Quick Reference

## The Golden Rule

**The Devvit splash screen IS the Reddit post. Your React app should NOT duplicate it.**

## Visual Flow

```
┌─────────────────────────────────────┐
│  REDDIT POST (Splash Screen)        │
│  ┌───────────────────────────────┐  │
│  │ 🏜️ Dig Site: r/AskReddit     │  │
│  │                               │  │
│  │ Excavate historical posts     │  │
│  │ ✅ Found: 0  💔 Broken: 0     │  │
│  │                               │  │
│  │  [ Start Digging ⛏️ ]         │  │ ← User clicks this
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                  ↓
                  ↓ Opens webview
                  ↓
┌─────────────────────────────────────┐
│  YOUR REACT APP (Webview)           │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   [Game Canvas]               │  │ ← Go straight to this!
│  │                               │  │
│  │   🔧 Tools: 📡 ⛏️ 🖌️         │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Do's and Don'ts

### ✅ DO:
- Configure splash in `reddit.submitCustomPost({ splash: {...} })`
- Make splash engaging with emojis and clear description
- Show stats/info in the splash description
- Go straight to your app after loading

### ❌ DON'T:
- Create another splash screen in React
- Duplicate the heading/description in your app
- Show another "start" button in your app
- Make users click through multiple screens to get to the app

## Code Checklist

- [ ] Splash configured in `submitCustomPost()`
- [ ] Splash has engaging heading with emoji
- [ ] Splash description includes key info
- [ ] Button text is action-oriented
- [ ] React app goes straight to main experience
- [ ] No duplicate splash in React app
- [ ] Loading screen is brief (if needed)

## Remember

Users clicked the button to get to your app. They don't want to see the same info again - they want to use the app!

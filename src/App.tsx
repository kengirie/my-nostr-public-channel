import { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { getPublicKey } from 'nostr-tools/pure';
import { nip19 } from "nostr-tools";
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { Relay } from 'nostr-tools/relay'
import './App.css';

async function getRelay() {
  const relay = await Relay.connect('wss://yabu.me/')
  console.log(`connected to ${relay.url}`)
  return relay;
}


function App() {
  const [sk, setSk] = useState('');
  const [pk, setPk] = useState('');
  const [events, setEvents] = useState<string[]>([])


   const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
     console.log('SecretKey:', sk);
     const secretKey = nip19.decode(sk).data;
     const publicKey = getPublicKey(secretKey);
      setPk(publicKey);
     console.log('PublicKey:',publicKey);
  };

useEffect(() => {
    const subscribeToRelay = async () => {
      if (pk) {
        const relay = await getRelay();
        relay.subscribe(
          [
            {
              kinds: [40],
              authors: [pk],
            },
          ],
          {
            onevent(event) {
              console.log('got event:', event.content);
              setEvents((prevEvents) => [...prevEvents, event.content]);
            },
            oneose() {
              relay.close();
              console.log('disconnected');
            }
          }
        );
      }
    };

  subscribeToRelay();
  }, [pk]);

  return (
    <>
      <h1>掲示板(仮)</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <TextField
          label="Secret Key"
          variant="outlined"
          value={sk}
          onChange={(e) => setSk(e.target.value)}
        />
         <Button type="submit" variant="contained">Submit</Button>
      </form>
      {pk && (
        <div>
          <h2>Public Key:</h2>
          <p>{pk}</p>
        </div>
      )}
      <div>
        <h2>Events:</h2>
        <List>
          {events.map((event, index) => (
            <ListItem key={index}>
              <ListItemText primary={event} />
            </ListItem>
          ))}
        </List>
      </div>
    </>
  )
}

export default App

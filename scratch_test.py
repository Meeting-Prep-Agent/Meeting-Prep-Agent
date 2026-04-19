import urllib.request, json

# 1. Get contact
try:
    req1 = urllib.request.Request('http://localhost:8000/api/v1/contacts', method='GET')
    with urllib.request.urlopen(req1) as response:
        contacts = json.loads(response.read().decode())
        print("Contacts:", len(contacts))
        if len(contacts) > 0:
            contact_id = contacts[0]['id']
            print("Using Contact ID:", contact_id)
            
            # 2. Generate Brief
            req2 = urllib.request.Request(
                'http://localhost:8000/api/v1/prep-brief/generate', 
                data=json.dumps({'contact_id': contact_id, 'optional_context': ''}).encode(), 
                headers={'Content-Type': 'application/json'}, 
                method='POST'
            )
            with urllib.request.urlopen(req2) as response2:
                print("Brief Generation Response:")
                print(response2.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print(e.read().decode())

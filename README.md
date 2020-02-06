# Puzzlepart Pillagers Azure Storage Functions

## Endpoints
### GetUnits
GET
https://pillagers-storage-functions.azurewebsites.net/api/GetUnits?email={user email}

Returns all units that user with `user email` owns.

### CreateUnit
POST
https://pillagers-storage-functions.azurewebsites.net/api/CreateUnit?email={user email}

Creates a new unit belonging to `user email`

Headers: 
Content-Type: application/json

Example body:
```
{
    "Dead": false,
    "FirstName": "Oluf",
    "LastName": "Siggurdsson",
    "Level": "2",
    "Rank": "Thrall",
    "XP": 15
} 
```

### GainXp
POST
https://pillagers-storage-functions.azurewebsites.net/api/GainXp

Merges new XP value with the existing object with the supplied email/id combination

Headers:
Content-Type: application/json

Example body:
```
{
	"email": "stian@pzl.onmicrosoft.com",
	"id": "be91fdc0-48e9-11ea-9656-19711baced67",
    "XP": 3
}
```

### CreateKing
POST
https://pillagers-storage-functions.azurewebsites.net/api/CreateKing

Headers:
Content-Type: application/json

Example body:
```
{
	"email": "havard@pzl.onmicrosoft.com",
    "Penning": 0,
    "lat" "0",
    "lon": "0",
    "XPGain": 1
}
```

### GetKing
GET
https://pillagers-storage-functions.azurewebsites.net/api/GetKing?email={user email}

Returns the king associated with `user email` and his data

### GainPenning
POST
https://pillagers-storage-functions.azurewebsites.net/api/GainPenning

Merges new Penning value with the existing object with the supplied email

Headers:
Content-Type: application/json

Example body:
```
{
	"email": "stian@pzl.onmicrosoft.com",
    "Penning": 200
}
```
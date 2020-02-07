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

### SetXp
POST
https://pillagers-storage-functions.azurewebsites.net/api/SetXp

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

### SetLevel
POST
https://pillagers-storage-functions.azurewebsites.net/api/SetLevel

Merges new Level value with the existing object with the supplied email/id combination

Headers:
Content-Type: application/json

Example body:
```
{
	"email": "stian@pzl.onmicrosoft.com",
	"id": "be91fdc0-48e9-11ea-9656-19711baced67",
    "Level": 2
}
```

### SetRank
POST
https://pillagers-storage-functions.azurewebsites.net/api/SetRank

Merges new Rank value with the existing object with the supplied email/id combination

Headers:
Content-Type: application/json

Example body:
```
{
	"email": "stian@pzl.onmicrosoft.com",
	"id": "be91fdc0-48e9-11ea-9656-19711baced67",
    "Rank": "Berserker"
}
```

### SetXpGain
POST
https://pillagers-storage-functions.azurewebsites.net/api/SetXpGain

Merges new XPGain value with the existing object with the supplied email

Headers:
Content-Type: application/json

Example body:
```
{
	"email": "stian@pzl.onmicrosoft.com",
    "XPGain": 2
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
    "FirstName": "Håvard",
    "LastName": "Håvarsson",
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

### SetPenning
POST
https://pillagers-storage-functions.azurewebsites.net/api/SetPenning

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

### SetLocation
POST
https://pillagers-storage-functions.azurewebsites.net/api/SetLocation

Merges new lat/lon values with the existing object with the supplied email

Headers:
Content-Type: application/json

Example body:
```
{
	"email": "stian@pzl.onmicrosoft.com",
    "lat": "12",
    "lon": "69"
}
```

### GetLevels
GET
https://pillagers-storage-functions.azurewebsites.net/api/GetLevels

Returns the xp table for levelups and xp requirements

### GetRanks
GET
https://pillagers-storage-functions.azurewebsites.net/api/GetRanks

Returns the ranks table with corresponding level requirements
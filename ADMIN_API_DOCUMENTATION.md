# Sahyadri Tours and Travels — Admin API Documentation

Internal admin-only API. Not for public access.

## `POST` /admin/auth/login

**Summary**: Adminlogin

Single admin account login.
Only password is required — credentials stored in .env.
Returns a token signed with the admin JWT secret.

### Request Body
- **Schema**: `AdminLoginRequest`

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `POST` /admin/auth/logout

**Summary**: Adminlogout

Clear the admin session cookie.

### Responses
- **200**: Successful Response

---

## `GET` /admin/users

**Summary**: Listusers

List all users with optional search and role filter.
Search matches against email and full_name (case-insensitive).

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| page | query | No | integer |
| page_size | query | No | integer |
| search | query | No | string |
| role | query | No | string |

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `GET` /admin/users/detail

**Summary**: Getuserdetail

Get full user detail by name or email (case-insensitive, first match).

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| search | query | Yes | string |

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `GET` /admin/users/{identifier}

**Summary**: Getuserbyid

Get full user detail by ID, name, or email.
- If `identifier` is a valid MongoDB ObjectId → lookup by ID.
- Otherwise → case-insensitive search on full_name or email (first match).

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| identifier | path | Yes | string |

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `DELETE` /admin/users/{user_id}

**Summary**: Deleteuser

Permanently delete a user account and all their bookings.

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| user_id | path | Yes | string |

### Responses
- **204**: Successful Response
- **422**: Validation Error

---

## `GET` /admin/packages

**Summary**: Adminlistpackages

List all tour packages with optional search and filter.
Embedding field is always excluded from responses.

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| page | query | No | integer |
| page_size | query | No | integer |
| search | query | No | string |
| traveler_type | query | No | string |
| destination | query | No | string |

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `POST` /admin/packages

**Summary**: Admincreatepackage

Create a new tour package.
- package_id must be unique.
- package_url defaults to /packages/{package_id} if not provided.

### Request Body
- **Schema**: `AdminCreatePackageRequest`

### Responses
- **201**: Successful Response
- **422**: Validation Error

---

## `GET` /admin/packages/{package_id}

**Summary**: Admingetpackage

Get full details of a single package by its package_id.

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| package_id | path | Yes | string |

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `PUT` /admin/packages/{package_id}

**Summary**: Adminreplacepackage

Full replacement of a package (PUT).
Preserves the existing MongoDB document _id and embedding.

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| package_id | path | Yes | string |

### Request Body
- **Schema**: `AdminCreatePackageRequest`

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `PATCH` /admin/packages/{package_id}

**Summary**: Adminpatchpackage

Partial update - only provided fields are updated.
Uses raw Motor (MongoDB driver) to bypass Pydantic re-validation
of older documents missing newer fields (images, room_options, etc.).

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| package_id | path | Yes | string |

### Request Body
- **Schema**: `AdminUpdatePackageRequest`

### Responses
- **200**: Successful Response
- **422**: Validation Error

---

## `DELETE` /admin/packages/{package_id}

**Summary**: Admindeletepackage

Permanently delete a package.
Note: existing bookings that reference this package are NOT deleted;
they retain their denormalized package_title and destination fields.

### Parameters
| Name | In | Required | Type |
|---|---|---|---|
| package_id | path | Yes | string |

### Responses
- **204**: Successful Response
- **422**: Validation Error

---

## `GET` /

**Summary**: Root

### Responses
- **200**: Successful Response

---

## `GET` /health

**Summary**: Healthcheck

### Responses
- **200**: Successful Response

---

## `GET` /_debug_hash

**Summary**: Debughash

### Responses
- **200**: Successful Response

---

# Schemas

## AdminCreatePackageRequest

| Property | Type | Description |
|---|---|---|
| package_id | `string` | Unique human-readable ID, e.g. GOA_3D2N_001 |
| title | `string` |  |
| from | `string` | Departure city / region |
| destination | `string` |  |
| days | `integer` |  |
| nights | `integer` |  |
| price_per_person | `number` |  |
| price_per_child | `any` | None = children not applicable |
| gst_included | `boolean` |  |
| inclusions | `array[string]` |  |
| exclusions | `array[string]` |  |
| itinerary | `array[string]` |  |
| highlights | `array[string]` |  |
| description | `string` |  |
| package_url | `string` | Auto-set to /packages/{package_id} if left blank |
| traveler_type | `array[string]` | Tags: family / honeymoon / solo / senior / friends / adventure / corporate |
| images | `array[string]` |  |
| available_dates | `array[string]` |  |
| room_options | `array[RoomOption]` |  |

## AdminLoginRequest

| Property | Type | Description |
|---|---|---|
| password | `string` |  |

## AdminUpdatePackageRequest

| Property | Type | Description |
|---|---|---|
| title | `any` |  |
| from | `any` |  |
| destination | `any` |  |
| days | `any` |  |
| nights | `any` |  |
| price_per_person | `any` |  |
| price_per_child | `any` |  |
| gst_included | `any` |  |
| inclusions | `any` |  |
| exclusions | `any` |  |
| itinerary | `any` |  |
| highlights | `any` |  |
| description | `any` |  |
| package_url | `any` |  |
| traveler_type | `any` |  |
| images | `any` |  |
| available_dates | `any` |  |
| room_options | `any` |  |

## AdminUserDetailResponse

| Property | Type | Description |
|---|---|---|
| id | `string` |  |
| email | `string` |  |
| full_name | `any` |  |
| phone | `any` |  |
| gender | `any` |  |
| role | `string` |  |
| created_at | `string` |  |
| profile_photo_url | `any` |  |
| total_bookings | `integer` |  |
| confirmed_bookings | `integer` |  |
| cancelled_bookings | `integer` |  |

## HTTPValidationError

| Property | Type | Description |
|---|---|---|
| detail | `array[ValidationError]` |  |

## RoomOption

| Property | Type | Description |
|---|---|---|
| room_type | `string` |  |
| label | `string` |  |
| price_per_night | `number` |  |
| max_occupancy | `integer` |  |
| available_count | `integer` |  |

## ValidationError

| Property | Type | Description |
|---|---|---|
| loc | `array[]` |  |
| msg | `string` |  |
| type | `string` |  |
| input | `any` |  |
| ctx | `object` |  |


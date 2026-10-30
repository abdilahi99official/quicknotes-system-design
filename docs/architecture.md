```markdown
# QuickNotes System Architecture

## Requirements
* **Functional Requirements:** User authentication, note CRUD operations, tagging, real-time sync, and lightning-fast search retrieval.
* **Non-Functional Requirements:** 99.99% availability, low latency (< 100ms API response time), horizontal scalability to support 1 million active users, and data durability.

---

## Load Estimates (1 Million Active Users)
* **DAU:** 1,000,000 active users.
* **Writes per Second:** Assuming each user creates/updates 5 notes per day = 5,000,000 writes/day $\approx$ **58 writes/sec** (Peak: ~290 writes/sec).
* **Reads per Second:** Assuming each user views 30 notes/pages per day = 30,000,000 reads/day $\approx$ **347 reads/sec** (Peak: ~1,735 reads/sec).
* **Storage per Year:** 5,000,000 writes/day × 365 days = 1.825 billion notes/year. At ~2 KB per note record = **~3.65 TB/year**.

---

## Architecture Diagram
```text
[ Clients (Web / Mobile) ]
           │
           ▼
     [ Cloud DNS ]
           │
           ▼
   [ Cloud CDN / WAF ]
           │
           ▼
[ Global Load Balancer ]
           │
           ├──► [ App Servers Cluster ] ──► [ Message Queue ] ──► [ Background Workers ]
           │           │
           │           └──► [ Primary Database (Writes) ]
           │                      │
           │                      ▼ (Async Replication)
           ▼                 [ Read Replicas (Reads) ]
[ In-Memory Cache (Redis) ] ◄─────┘
Component Descriptions
Cloud DNS: Translates human-readable domain names into IP addresses and routes clients to the nearest edge location.

Cloud CDN: Caches static web assets (HTML, CSS, JS) at edge servers to reduce load on origin servers and accelerate delivery.

Global Load Balancer: Distributes incoming traffic evenly across multiple app servers to ensure high availability and prevent overloads.

App Servers Cluster: Stateless servers that process business logic, handle API requests, and authenticate users.

In-Memory Cache (Redis): Caches frequent user sessions and hot notes data to deliver sub-millisecond read responses.

Primary Database: Handles all transactional write operations (INSERT, UPDATE, DELETE) to maintain strict ACID compliance.

Read Replicas: Scale read-heavy traffic by serving read queries asynchronously replicated from the primary database.

Message Queue & Workers: Decouples heavy or asynchronous background tasks (like analytics or email notifications) from the main request cycle.

Request Flows
GET /notes Flow
Client sends request through Load Balancer to an App Server.

App Server checks In-Memory Cache (Redis) for cached user notes.

If cache miss, App Server queries the Read Replica Database, caches the result in Redis, and returns the response to the client.

POST /notes Flow
Client sends note payload (POST /api/v1/notes) to Load Balancer.

App Server validates request data and user authorization.

App Server executes INSERT statement on the Primary Database.

Primary Database replicates the new record asynchronously to Read Replicas and invalidates the user's Redis cache key.

App Server returns 201 Created with the new note object.

Trade-Offs & SPOF Avoidance
Trade-Off 1: Strong vs. Eventual Consistency in Caching

Choice: We choose eventual consistency for cached note lists.

Consequence: A newly created note appears instantly via client-side state, but cached reads might take a few seconds to reflect across edge nodes. This trade-off drastically reduces database load.

Trade-Off 2: Multi-Region Replication Complexity

Choice: Single-region primary database with global read replicas.

Consequence: Simplifies conflict resolution for writes while providing fast global read performance.

Single Points of Failure (SPOF) Avoidance:

App servers are deployed in auto-scaling clusters across multiple availability zones.

Databases use automated failover: if the Primary Database fails, a Read Replica is automatically promoted to Primary. Load balancers continuously health-check servers and route traffic away from failing nodes.


---

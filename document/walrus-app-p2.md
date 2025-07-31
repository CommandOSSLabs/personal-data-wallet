
75/209

7/28/25, 9:22 PM

Walrus

The  InvalidBlobID  event is emitted when storage nodes detect an incorrectly encoded blob.

Anyone attempting a read on such a blob is guaranteed to also detect it as invalid.

System level events such as  EpochChangeStart  and  EpochChangeDone  indicate transitions

between epochs. And associated events such as  ShardsReceived ,  EpochParametersSelected ,

and  ShardRecoveryStart  indicate storage node level events related to epoch transitions, shard

migrations and epoch parameters.

System and staking information

The Walrus system object contains metadata about the available and used storage, as well as
the price of storage per KiB of storage in FROST. The committee structure within the system

object can be used to read the current epoch number, as well as information about the
committee. Committee changes between epochs are managed by a set of staking contracts
that implement a full delegated proof of stake system based on the WAL token.

https://docs.wal.app/print.html

76/209

7/28/25, 9:22 PM

Walrus

Data security

Walrus provides decentralized storage for application and user data. Walrus ensures
availability and integrity but does not provide native encryption for data. By default, all blobs
stored in Walrus are public and discoverable by all. If your app needs encryption or access
control, secure data before uploading to Walrus.

Securing data with Seal

Use Seal for encryption and onchain access control.

Seal allows you to:

Encrypt data using threshold encryption, where no single party holds the full decryption
key.
De?ne onchain access policies that determine who can decrypt the data and under what

conditions.
Store encrypted content on Walrus while keeping decryption logic veri?able and ?exible.

Seal integrates naturally with Walrus and is recommended for any use case involving:

Sensitive o?chain content (e.g., user documents, game assets, private messages)
Time-locked or token-gated data

Data shared between trusted parties or roles

To get started, refer to the Seal SDK.

https://docs.wal.app/print.html

77/209

7/28/25, 9:22 PM

Walrus

Quilt: Walrus native batch store tool

Quilt is a batch storage feature, aiming to optimize the storage cost and e?ciency of large
numbers of small blobs. Prior to quilt, storing small blobs (less than 10MB) in Walrus involved
higher per-byte costs due to internal system data overhead. Quilt addresses this by encoding
multiple (up to 666 for QuiltV1) blobs into a single unit called a quilt, signi?cantly reducing
Walrus storage overhead and lowering costs to purchase Walrus/Sui storage, as well as Sui
computation gas fees.

Importantly, each blob within a quilt can be accessed and retrieved individually, without
needing to download the entire quilt. Moreover, the blob boundaries in a quilt align with

Walrus internal structures as well as Walrus storage nodes, this allows for retrieval latency that
is comparable to, or even lower than, that of a regular blob.

In addition, quilt introduces custom, immutable  Walrus-native  blob metadata, allowing user

to assign di?erent types of  metadata  to each blob in a quilt, for example, unique identi?ers, as

well as tags of key-value pairs. Note, this metadata is functionally similar to the existing Blob
Metadata store on-chain, however, there are some fundamental distinctions. First,  Walrus-

native  metadata is stored alongside the blob data, and hence it reduces costs and simpli?es

management. Second, this metadata can be used for e?cient lookup of blobs within a quilt, for
example, reading blobs with a particular tag. When storing a quilt, users can set the  Walrus-
native  metadata via the quilt APIs.

Warning

An identi?er must start with an alphanumeric character, contain no trailing whitespace, and
not exceed 64 KB in length.

The total size of all tags combined must not exceed 64 KB.

Important considerations

It's important to note that blobs stored in a quilt are assigned a unique ID, called
QuiltPatchId , that di?ers from the  BlobId  used for regular Walrus blobs, and a
QuiltPatchId  is determined by the composition of the entire quilt, ranther than the single

blob, and hence it may change if the blob is stored in a di?erent quilt. Moreover, individual
blobs cannot be deleted, extended or shared separately; these operations can only be applied
to the entire quilt.

https://docs.wal.app/print.html

78/209

7/28/25, 9:22 PM

Walrus

Target use cases

Using quilt requires minimal additional e?ort beyond standard procedures. The primary
considerations are that the unique ID assigned to each blob within a quilt cannot be directly
derived from its contents, unlike a regular Walrus blob_id, deletion, extension and share

operations are not allowed on individual blobs in the quilt, only the quilt can be the target.

Lower cost

This is the most clear and signi?cant use case. Quilt is especially advantageous for managing
large volumes of small blobs, as long as they can be grouped together by the user. The cost

savings come from two sources:

Walrus storage and write fees: By consolidating multiple small blobs into a single quilt,
storage costs can be reduced dramaticallyùmore than 400x for ?les around 10KBù
making it an e?cient solution for cost-sensitive applications.

Sui computation and object storage fees: Storing many blobs as a single quilt

signi?cantly reduces Sui gas costs. In our test runs with 600 ?les stored in a quilt, we
observed 238x savings in Sui fees compared to storing them as individual blobs. Notably,
Sui cost savings only depend on the number of ?les per quilt rather than the individual ?le
sizes.

The following table demonstrates the potential cost savings in WAL when storing 600 small

blobs for 1 epoch as a quilt compared to storing them as separate blobs.

Blob
size

10KB

50KB

100KB

200KB

500KB

1MB

Regular blob storage
cost

Quilt storage
cost

Cost saving
factor

2.088 WAL

2.088 WAL

2.088 WAL

2.088 WAL

2.136 WAL

2.208 WAL

0.005 WAL

0.011 WAL

0.020 WAL

0.036 WAL

0.084 WAL

0.170 WAL

409x

190x

104x

58x

25x

13x

Note: The costs shown in this table are for illustrative purposes only and were obtained
from test runs on Walrus Testnet. Actual costs may vary due to changes in smart contract
parameters, networks, and other factors. The comparison is between storing 600 ?les as a
single quilt versus storing them as individual blobs in batches of 25.

https://docs.wal.app/print.html

79/209

7/28/25, 9:22 PM

Walrus

Organizing collections

Quilt provides a straightforward way to organize and manage collections of small blobs within a
single unit. This can simplify data handling and improve operational e?ciency when working
with related small ?les, such as NFT image collections.

Walrus native blob metadata

Quilt supports immutable, custom metadata stored directly in Walrus, including identi?ers and
tags. These features facilitate better organization, enable ?exible lookup, and assist in
managing blobs within each quilt, enhancing retrieval and management processes.

For details on how to use the CLI to interact with quilt, see the Batch-storing blobs with quilts

section.

https://docs.wal.app/print.html

80/209

7/28/25, 9:22 PM

Walrus

Operator guide

This guide contains information about operating services in the network, speci?cally storage
nodes, aggregators and publishers.

This operator guide describes the following:

Operating an aggregator or publisher

Operating a storage node

https://docs.wal.app/print.html

81/209

7/28/25, 9:22 PM

Walrus

Operating an aggregator or publisher

This page describes how you can run a Walrus aggregator or publisher exposing the HTTP API.

Starting the daemon locally

You can run a local Walrus daemon through the  walrus  binary. There are three di?erent

commands:

walrus aggregator  starts an "aggregator" that o?ers an HTTP interface to read blobs

from Walrus.
walrus publisher  starts a "publisher" that o?ers an HTTP interface to store blobs in

Walrus.
walrus daemon  o?ers the combined functionality of an aggregator and publisher on the

same address and port.

The aggregator does not perform any on-chain actions, and only requires specifying the
address on which it listens:

walrus aggregator --bind-address "127.0.0.1:31415"

The publisher and daemon perform on-chain actions and thus require a Sui Testnet wallet with
su?cient SUI and WAL balances. To enable handling many parallel requests without object
con?icts, they create internal sub-wallets since version 1.4.0, which are funded from the main
wallet. These sub-wallets are persisted in a directory speci?ed with the  --sub-wallets-dir

argument; any existing directory can be used. If it already contains sub-wallets, they will be
reused.

By default, 8 sub-wallets are created and funded. This can be changed with the  --n-clients

argument. For simple local testing, 1 or 2 sub-wallets are usually su?cient.

For example, you can run a publisher with a single sub-wallet stored in the Walrus
con?guration directory with the following command:

PUBLISHER_WALLETS_DIR=~/.config/walrus/publisher-wallets
mkdir -p "$PUBLISHER_WALLETS_DIR"
walrus publisher \
  --bind-address "127.0.0.1:31416" \
  --sub-wallets-dir "$PUBLISHER_WALLETS_DIR" \
  --n-clients 1

https://docs.wal.app/print.html

82/209

7/28/25, 9:22 PM

Walrus

Replace  publisher  by  daemon  to run both an aggregator and publisher on the same address

and port.

Warning

While the aggregator does not perform Sui on-chain actions, and therefore consumes no

gas, the publisher does perform actions on-chain and will consume both SUI and WAL
tokens. It is therefore important to ensure only authorized parties may access it, or other
measures to manage gas costs, especially in a future Mainnet deployment.

By default, store blob requests are limited to 10 MiB; you can increase this limit through the  --
max-body-size  option. Store quilt requests are limited to 100 MiB by default, and can be

increased using the  --max-quilt-body-size  option.

Daemon metrics

Services by default export a metrics end-point accessible via  curl

http://127.0.0.1:27182/metrics . It can be changed using the  --metrics-address
<METRICS_ADDRESS>  CLI option.

Sample systemd con?guration

Below is an example of an aggregator node which hosts a HTTP endpoint that can be used to

fetch data from Walrus over the web.

The aggregator process is run via the  walrus  client binary as discussed above. It can be run in

many ways, one example being via a systemd service:

[Unit]
Description=Walrus Aggregator

[Service]
User=walrus
Environment=RUST_BACKTRACE=1
Environment=RUST_LOG=info
ExecStart=/opt/walrus/bin/walrus --config /opt/walrus/config/client_config.yaml
aggregator --bind-address 0.0.0.0:9000
Restart=always

LimitNOFILE=65536

https://docs.wal.app/print.html

83/209

7/28/25, 9:22 PM

Walrus

Publisher operation and con?guration

We list here a few important details on how the publisher deals with funds and objects on Sui.

Number of sub-wallets and upload concurrency

As mentioned above, the publisher uses sub-wallets to allow storing blobs in parallel. By
default, the publisher uses 8 sub-wallets, meaning it can handle 8 blob store HTTP requests
concurrently.

In order to operate a high performance and concurrency publisher the following options may
be of interest.

The  --n-clients <NUM>  option creates a number of separate wallets used to perform

concurrent Sui chain operations. Increase this to allow more parallel uploads. Note that a
higher number will require more SUI and WAL coins initially too, to be distributed to more
wallets.

The  --max-concurrent-requests <NUM>  determines how many concurrent requests can

be handled including Sui operations (limited by number of clients) but also uploads. After
this is exceeded more requests are queued up to the  --max-buffer-size <NUM> , after

which requests are rejected with a HTTP 429 code.

SUI coin management in sub-wallets

Each of the sub-wallets requires funds to interact with the chain and purchase storage. For this
reason, a background process checks periodically if the sub-wallets have enough funds. In
steady state, each of the sub-wallets will have a balance of 0.5-1.0 SUI and WAL. The amount
and triggers for coin re?lls can be con?gured through CLI arguments.

To tweak how re?lls are handled you may use the  --refill-interval <REFILL_INTERVAL> ,  --
gas-refill-amount <GAS_REFILL_AMOUNT> ,  --wal-refill-amount <WAL_REFILL_AMOUNT>  and  -

-sub-wallets-min-balance <SUB_WALLETS_MIN_BALANCE>  arguments.

Lifecycle of created Blob on-chain objects

Each store operation in Walrus creates a  Blob  object on Sui. This blob object represents the

(partial) ownership over the associated data, and allows certain data management operations
(e.g., in the case of deletable blobs).

https://docs.wal.app/print.html

84/209

7/28/25, 9:22 PM

Walrus

When the publisher stores a blob on behalf of a client, the  Blob  object is initially owned by the

sub-wallet that stored the blob. Then, the following cases are possible, depending on the
con?guration:

If the client requests to store a blob and speci?es the  send_object_to  query parameter

(see the relevant section for examples), then the  Blob  object is transferred to the

speci?ed address. This is a way for clients to get back the created object for their data.
If the  send_object_to  query parameter is not speci?ed, two cases are possible:

By default the sub-wallet transfers the newly-created blob object to the main wallet,

such that all these objects are kept there. This behavior can be changed by setting
the  --burn-after-store  ?ag, and the blob object is then immediately deleted.
However, note that this ?ag does not a?ect the use of the  send_object_to  query

parameter: Regardless of this ?ag's status, the publisher will send created objects to
the address in the  send_object_to  query parameter, if it is speci?ed in the PUT

request.

Advanced publisher uses

The setup and use of an "authenticated publisher" is covered in a separate section.

https://docs.wal.app/print.html

85/209

7/28/25, 9:22 PM

Walrus

The authenticated publisher

We now describe the authenticated publisher, which requires the HTTP request to store a blob
to be authenticated. Such an authenticated publisher can be used as a building block for
services that require storing over HTTP on Walrus  mainnet , where an "open" publisher is
undesirable (because of the  SUI  and  WAL  cost of publishing to Walrus).

Overview

The Walrus Publisher can be con?gured to require a JWT (JSON web Token) with each HTTP
request, for user authentication. The authentication system ensures that only authorized
clients can store blobs and allows for ?ne-grained control over storage parameters through
JWT claims.

The authenticated publishing ?ow occurs, at a high level, as follows:

1. Publisher setup: The publisher operator:

Funds the publisher's wallet with su?cient  SUI  and  WAL ;

Con?gures the publisher to only accept authenticated requests. This entails setting
the algorithm to authenticate JWTs, the expiration time for JWTs, and the JWT
authentication secret.

2. Authentication channel setup: The publisher operator sets up a channel through which
users can obtain the JWT tokens. This step can be performed in any way that produces a
valid JWT, and is not provided in this implementation.

3. Client authentication: The client obtains a JWT token from the channel set up in the
previous step. The JWT token can specify Walrus-relevant constraints, such as the

maximum number of epochs the JWT can be used to store for, and the maximum size of
the blobs being stored.

4. Publish request: The client requests to store a blob using the publisher. This is done

through an HTTP PUT request containing the JWT in an Authorization Bearer HTTP header.

5. Store to Walrus: The publisher checks the JWT, and checks that the store request is

compliant with the constraints speci?ed in the JWT (e.g., the blob being stored is smaller
than the authorized max size).

6. (Optional) Asset return:: If so speci?ed, the publisher returns the newly-created  Blob

object to the Sui Address set in the request.

https://docs.wal.app/print.html

86/209

7/28/25, 9:22 PM

Walrus

Request authentication ?ow

We now provide an example of how the authenticated publisher can be used in a webapp that
allows users to upload ?les to Walrus through a web frontend. This is especially useful if the
users are not required to have a wallet, and therefore cannot store blobs to Walrus on their
own.

The user connects to the webapp, authenticates (e.g., through name and password, as
they have no wallet).
The user uploads the ?le it wants to store, and selects the number of epochs for which it
would like to store it.
The webapp frontend sends information on the size of the ?le and the number of epochs

to the backend.
With this information, the backend computes if the user is authorized to store the given
amount of data for the selected number of epochs, and possibly reduces the user quota.
This accounting can be done locally, but also directly on Sui. Importantly, at this point the
backend can also check the cost of the upload (in terms of SUI and WAL), and check if it is

within the user's budget.
If the user is authorized to store, the backend returns a JWT token with the size and epoch
limits to the frontend.
The frontend sends the ?le to the publisher via a  PUT  request, setting the JWT in the

Authorization header as a Bearer token.

Upon receipt, the publisher veri?es:

The token signature using the con?gured secret;
Token expiration;
Token uniqueness (prevents replay attacks);
Upload parameters against claims (if enabled).

If all checks succeed, the publisher stores the ?le on Walrus.
If set, the publisher ?nally returns the created  Blob  object to the address speci?ed by the

user.

One important note here is that the JWT token itself is a "single use" token, and should not be
used for accounting purposes. I.e., one token can be used to store only one ?le, and after that

the token is rejected by the replay suppression system.

Publisher setup

The publisher is con?gured at startup using the following command line arguments:

--jwt-decode-secret : The secret key used to verify JWT signatures. If set, the publisher
will only store blobs with valid JWTs.

https://docs.wal.app/print.html

87/209

7/28/25, 9:22 PM

Walrus

--jwt-algorithm : The algorithm used for JWT veri?cation (defaults to HMAC).

--jwt-expiring-sec : Duration in seconds after which the JWT is considered expired.

--jwt-verify-upload : Enable veri?cation of upload parameters against JWT claims.

Additional details follow.

The JWT decode secret

The secret can be hex string, starting with  0x . If this parameter is not speci?ed, the

authentication will be disabled.

All JWT tokens are expected to have the  jti  (JWT ID) set in the claim to a unique value. The JWT

is used for replay suppression, i.e., to avoid malicious users storing multiple times using the
same JWT. Therefore, the JWT creator must ensure that this value is unique among all requests
to the publisher. We recommend using large nonces to avoid collisions.

Authentication algorithm

The following algorithms are supported: "HS256", "HS384", "HS512", "ES256", "ES384", "RS256",
"RS384", "PS256", "PS384", "PS512", "RS512", "EdDSA". The default JWT authentication algorithm
will be HS256.

JWT Expiration

If the parameter is set and greater than 0, the publisher will check if the JWT token is expired
based on the "issued at" ( iat ) value in the JWT token.

Upload parameters veri?cation

If set, the publisher will verify that the requested upload matches the claims in the JWT. This
does not enable or disable the cryptographic authentication of the JWT; it just enables or
disables the checks that ensure the contents of the JWT claim match the requested blob
upload.

Speci?cally, the publisher will:

Verify that the number of  epochs  in query is the the same as  epochs  in the JWT, if
present;

https://docs.wal.app/print.html

88/209

7/28/25, 9:22 PM

Walrus

Verify that the  send_object_to  ?eld in the query is the same as the  send_object_to  in

the JWT, if present;
Verify the size of uploaded ?le;

Verify the uniqueness of the  jti  claim.

Disabiling the parameter veri?cation may be useful in case the source of the store requests is
trusted, but the publisher mayy be contacted by untrusted sources. In that case, the
authentication of the JWT is necessary, but not the veri?cation of the upload parameters.

Replay-suppression con?guration

As mentioned above, the publisher supports replay suppression to avoid the malicious reuse of
JWT tokens.

The replay suppression supports the following con?guration parameters:

--jwt-cache-size : The maximum size of the publisher's JWT cache, where the  jti  JWT
IDs of the "used" JWTs are kept until their expiration. This is a hard upperbound on the
number of entries in the cache, after which additional requests to store are rejected. This
hard bound is introduced to avoid DoS attacks on the publisher through the cache.
--jwt-cache-refresh-interval : The interval (in seconds) after which the cache is

refreshed, and expired JWTs are removed (possibly creating space for additional JWTs to
be inserted).

Details on the JWT

JWT Fields

The current authenticated publisher implementation does not provide a way to generate the

JWTs and distribute them to the clients. These can be generated with any tool (examples on
how to create a JWT are given in the next section), as long as they respect the following
constraints.

Mandatory ?elds

exp  (Expiration): timestamp when the token expires;
jti  (JWT ID): unique identi?er for the token to prevent replay attacks;

https://docs.wal.app/print.html

89/209

7/28/25, 9:22 PM

Optional ?elds

Walrus

iat  (Issued At): Optional timestamp when the token was issued;
send_object_to : Optional Sui address where the newly-created  Blob  object should be

sent;
epochs : Optional exact number of epochs the blob should be stored for

max_epochs : Optional maximum number of epochs the blob can be stored for
max_size : Optional maximum size of the blob in bytes
size : Optional exact size of the blob in bytes

Note: The  epochs  and  max_epochs  claims cannot be used together, and neither can  size  and

max_size . Using both in either case will result in token rejection.

Importanlty, the JWT (at the moment) can only encode information on the size and epochs of
the blob to store, and not on the "amount of SUI and WAL" the user is allowed to consume. This

should be done on the backend, before issuing the JWT.

Creating a valid JWT in the backend[

We provide here a few examples on how to create JWTs that can be consumed by the
authenticated publisher.

Rust

In Rust, the  jsonwebtoken  crate can be used to create JWTs.

In our code, we use the following struct to deserialize the incoming tokens in the publisher (see
the the code for the complete version).

pub struct Claim {
    pub iat: Option<i64>,
    pub exp: i64,
    pub jti: String,
    pub send_object_to: Option<SuiAddress>,
    pub epochs: Option<u32>,
    pub max_epochs: Option<u32>,
    pub size: Option<u64>,
    pub max_size: Option<u64>,
}

The same struct can be used to create and then encode valid tokens in Rust. This will be
something along the lines of:

https://docs.wal.app/print.html

90/209

7/28/25, 9:22 PM

Walrus

use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};

...

let encoding_key = EncodingKey::from_secret("my_secret".as_bytes());
let claim = Claim { /* set here the parameters for the Claim struct above */ };
let jwt = encode(&Header::default(), &claim, &encode_key).expect("a valid claim
and key");

https://docs.wal.app/print.html

91/209

7/28/25, 9:22 PM

Walrus

Operating a storage node

This section contains information about operating a storage node. Currently, this guide
contains information about storage node commissions and governance. In the future, it will be
expanded with additional information about running a node.

https://docs.wal.app/print.html

92/209

7/28/25, 9:22 PM

Walrus

Commission and governance

While most node parameters can be changed using the StorageNodeCap and are automatically
updated based on the values in the node con?guration, authorization for contract upgrades
and for withdrawing the storage node commission is handled separately, to ensure that the hot
wallet on the storage node does not need to be authorized for these operations.

We strongly recommend to all node operators to designate secure wallets for these operations
that are not stored on the storage node machines.

This page explains how to update the entities that are authorized for governance (i.e. contract
upgrade) and commission operations and how these operations are performed.

Update the commission receiver and entity authorized for
governance

It is possible to either designate an arbitrary object as a capability for governance/commission

operations or to designate an address to be authorized.

Warning

Once set, only the authorized entity (either based on the address or capability) can change
the authorization again, so only set it to addresses/objects that you control and make sure
they remain accessible.

To set the authorization to receive the commission and perform governance operations you

can either use the  walrus  binary in your CLI, or you can use the node operations web
interface.

Using the CLI

The following assumes that you have the  walrus  binary correctly set up, using the wallet that
is currently authorized to perform these operations. If this is the ?rst time updating the
authorized entities, this will be the wallet that you used to setup the storage node. To specify a
wallet and/or con?g that are not in the standard locations, you can specify them using the  --
wallet  and  --config  command line arguments.

https://docs.wal.app/print.html

93/209

7/28/25, 9:22 PM

Walrus

Note that the authorized entities for commission and governance are independent, i.e., they do
not need to be set to the same address or object.

NODE_ID=            # Set this to your node ID.
COMMISSION_AUTHORIZED_ADDRESS= # Set this to a secure wallet address that you
control.
GOVERNANCE_AUTHORIZED_ADDRESS= # Set this to a secure wallet address that you
control.
walrus node-admin set-commission-authorized --node-id $NODE_ID --address
$COMMISSION_AUTHORIZED_ADDRESS
walrus node-admin set-governance-authorized --node-id $NODE_ID --address
$GOVERNANCE_AUTHORIZED_ADDRESS

Instead of specifying an authorized address using the  --address  ?ag, an arbitrary object can

be designated as capability, using the  --object  ?ag:

NODE_ID=           # Set this to your node ID.
COMMISSION_AUTHORIZED_OBJECT= # Set this to the ID of an object that you own in a
secure wallet.
GOVERNANCE_AUTHORIZED_OBJECT= # Set this to the ID of an object that you own in a
secure wallet.
walrus node-admin set-commission-authorized --node-id $NODE_ID --object
$COMMISSION_AUTHORIZED_OBJECT
walrus node-admin set-governance-authorized --node-id $NODE_ID --object
$GOVERNANCE_AUTHORIZED_OBJECT

Using the web interface

Go to the operator panel on the staking dApp, connect your wallet and select your node either

through the drop-down menu or by pasting your node ID. Then select  Set Commission
Receiver  or  Set Governance Authorized  and follow the steps to send the transaction.

Collecting commission

To collect your commission, you can again either use the CLI or the web interface. To use the
CLI, make sure that  walrus  is con?gured to use the authorized wallet and run the following
command:

NODE_ID=           # Set this to your node ID.
walrus node-admin --node-id $NODE_ID collect-commission

https://docs.wal.app/print.html

94/209

7/28/25, 9:22 PM

Walrus

To use the web interface, go to the operator panel on the staking dApp, connect your wallet
and select your node either through the drop-down menu or by pasting your node ID. Then
select  Collect Commission  and follow the steps to send the transaction.

Contract upgrades

Contract upgrades in Walrus are managed through a quorum-based voting system. This
ensures that upgrades are only applied after su?cient consensus among node operators. The
process requires computing a digest of the proposed upgrade and voting on it.

Voting for quorum-based upgrades

When a contract upgrade is proposed, the proposer will generally share the code of the
proposed upgrade with other node operators. For example, if the Walrus Foundation proposes
an upgrade, it will share a speci?c commit hash in a branch on the Walrus GitHub Repository
that contains the proposed change in either the  testnet-contracts/walrus  or the  mainnet-
contracts/walrus  directory, depending on whether the Testnet or Mainnet contracts are being

upgraded.

The vote needs to complete within one epoch, otherwise the committee changes and the vote
needs to be repeated. To vote for an upgrade, complete the following steps.

Computing the upgrade digest

Operators should compute the package digest of the package to upgrade. It is important here
that the same compiler version is used and the correct Sui network is speci?ed. If you use a
standard Walrus Con?guration, the Sui network will be selected automatically when specifying
the Walrus network using the  --context  ?ag and using the up-to-date  walrus  version will
ensure that the compiler version is consistent across all voters.

To compute the digest of a proposed upgrade, you should use the  walrus node-admin
command. Assuming that your current working directory is the root of the Walrus repository
and you have checked out the correct commit, you would use the following command for
Testnet upgrades:

walrus node-admin package-digest --package-path testnet-contracts/walrus --context
testnet

And the following for Mainnet upgrades:

https://docs.wal.app/print.html

95/209

7/28/25, 9:22 PM

Walrus

walrus node-admin package-digest --package-path mainnet-contracts/walrus --context
mainnet

The command will output a digest (as Hex and Base64) that you can use to verify the proposal
and vote on the upgrade.

Voting on upgrades using the web interface

Voting on an upgrade using the web interface is the easiest way and also allows you to use any
wallet supported by your browser (e.g. hardware wallets) To vote through the web interface:

1. Go to the operator panel on the staking dApp.
2. Connect your wallet and select your node.
3. Navigate to the "Vote on Upgrade" section.
4. Paste the Base64 package digest from the previous step.
5. Follow the prompts to submit your vote.

Voting on upgrades using the CLI

To vote on an upgrade using the CLI, ensure that your  walrus  binary is con?gured with the

authorized wallet, and that you are on the correct branch in the root directory of the Walrus
repository. Then run the following for Testnet:

NODE_ID=   # Set this to your node ID.
PACKAGE_PATH=testnet-contracts/walrus
UPGRADE_MANAGER_OBJECT_ID=0xc768e475fd1527b7739884d7c3a3d1bc09ae422dfdba6b9ae94c1f
128297283c
walrus node-admin vote-for-upgrade \
    --node-id $NODE_ID \
    --upgrade-manager-object-id $UPGRADE_MANAGER_OBJECT_ID \
    --package-path $PACKAGE_PATH \
    --context testnet

And for Mainnet upgrades:

NODE_ID=   # Set this to your node ID.
PACKAGE_PATH=mainnet-contracts/walrus
UPGRADE_MANAGER_OBJECT_ID=0xc42868ad4861f22bd1bcd886ae1858d5c007458f647a49e502d44d
a8bbd17b51
walrus node-admin vote-for-upgrade \
    --node-id $NODE_ID \
    --upgrade-manager-object-id $UPGRADE_MANAGER_OBJECT_ID \
    --package-path $PACKAGE_PATH \
    --context mainnet

https://docs.wal.app/print.html

96/209

7/28/25, 9:22 PM

Upgrade completion

Walrus

Once a quorum of node operators (by number of shards) has voted in favor of a proposal, the
contract upgrade can be ?nalized. This will usually be done by the proposer using a PTB that
calls the respective functions to authorize, execute, and commit the upgrade. Then, depending
on the upgrade, either at the start of the next epoch or immediately, the system and staking
objects are migrated to the new version, by calling the  migrate  function in the  init  module
of the  walrus  package. The upgrade and migration can both be performed using the  walrus-

deploy  binary.

https://docs.wal.app/print.html

97/209

7/28/25, 9:22 PM

Walrus

Staking and unstaking

In Walrus, anyone can delegate stake to storage nodes and, by doing so, in?uence, which
storage nodes get selected for the committee in future epochs, and how many shards these
nodes will hold. Shards are assigned to storage nodes every epoch, roughly proportional to the
amount of stake that was delegated to them. By staking with a storage node, users also earn

rewards, as they will receive a share of the storage fees.

Since moving shards from one storage node to another requires transferring a lot of data, and
storage nodes potentially need to expand their storage capacity, the selection of the committee
for the next epoch is done ahead of time, in the middle of the previous epoch. This provides

su?cient time to storage-node operators to provision additional resources, if needed.

For stake to a?ect the shard distribution in epoch  e  and become "active", it must be staked
before the committee for this epoch has been selected, meaning that it has to be staked before
the midpoint of epoch  e - 1 . If it is staked after that point in time, it will only in?uence the

committee selection for epoch  e + 1  and thus only become active, and accrue rewards, in that

epoch.

Unstaking has a similar delay: because unstaking funds only has an e?ect on the committee in
the next committee selection, the stake will remain active until that committee takes over. This
means that, to unstake at the start of epoch  e , the user needs to "request withdrawal" before

the midpoint of epoch  e - 1 . Otherwise, that is, if the user unstakes after this point, the stake

will remain active, and continue to accrue rewards, throughout epoch  e , and the balance and
rewards will be available to withdraw at the start of epoch  e + 1 .

How to stake with the Walrus Staking dApp

The Walrus Staking dApp allows users to stake (or unstake) to any of the storage nodes of the
system.

To use the dApp, visit https://stake-wal.wal.app and connect your wallet:

Click the  Connect Wallet  button at the top right corner.

Select the wallet (if the wallet was connected before, this and the next step won't be
required).
Approve the connection.

https://docs.wal.app/print.html

98/209

7/28/25, 9:22 PM

Walrus

Exchange Testnet SUI to WAL

To be able to stake you will need to have Testnet WAL in your wallet. You can exchange your
Testnet SUI to WAL using the dApp as follows:

Click the  Get WAL  button.

Select the amount of SUI. This will be exchanged to WAL at a 1:1 rate.
And click  Exchange .

Follow the instructions in your wallet to approve the transaction.

Stake

Find the storage node that you want to stake to.

Below the system stats, there is the list of the "Current Committee" of storage
nodes.
You can select one of the nodes in that list or, if the storage node is not in the
current committee, you ?nd all the storage nodes at the bottom of the page.

Once you selected the storage node, click the stake button.
Select the amount of WAL.
Click Stake.
Follow the instructions in your wallet to approve the transaction.

Unstake

Find the  Staked WAL  you want to unstake.

Below the "Current Committee" list you will ?nd all your  Staked WAL .

Also you can expand a storage node and ?nd all your stakes with that node.
Depending on the state of the  Staked WAL  you will be able to unstake or Withdraw your

funds.
Click the  Unstake  or  Withdraw  button.

Click continue to con?rm your action.
Follow the instructions in your wallet to approve the transaction.

https://docs.wal.app/print.html

99/209

7/28/25, 9:22 PM

Walrus

Examples

As inspiration, we provide several simple examples in di?erent programming languages to
interact with Walrus through the various interfaces. They are located at
https://github.com/MystenLabs/walrus/tree/main/docs/examples and described below.

In addition, we have built actual applications on top of Walrus. The prime example is Walrus

Sites, with code available in the https://github.com/MystenLabs/walrus-sites repository.

And for an example of how to build a static website and store it as a Walrus Site with GitHub
actions, just look at the CI work?ow we use to publish this very site. There is also a Walrus-Sites
GitHub Action created by the community you can use to very easily publish your own Walrus
Sites using GitHub Actions (note that this is not created or o?cially supported by the Walrus
team at Mysten Labs).

See also our list of existing and upcoming SDKs and other tools.

Python

The Python examples folder contains a number of examples:

How to use the HTTP API to store and read a blob.
How to use the JSON API to store, read, and check the availability of a blob. Checking the

certi?cation of a blob illustrates reading the Blob Sui object that certi?es (see the Walrus
Sui reference).
How to track Walrus related Events.

JavaScript

A JavaScript example is provided showing how to upload and download a blob through a web
form using the HTTP API.

Move

For more complex applications, you may want to interact with Walrus on-chain objects. For that
purpose, the currently deployed Walrus contracts are included in our GitHub repository.

https://docs.wal.app/print.html

100/209

7/28/25, 9:22 PM

Walrus

Furthermore, we provide a simple example contract that imports and uses the Walrus objects.

https://docs.wal.app/print.html

101/209

7/28/25, 9:22 PM

Walrus

Troubleshooting

Debug logging

You can enable debug logging for Walrus by setting the environment variable
RUST_LOG=walrus=debug .

Latest binary

Before undertaking any other steps, make sure you have the latest  walrus  binary. If you have

multiple versions in di?erent locations, ?nd the binary that will actually be used with  which
walrus .

Old hardware or incompatible VMs

Our standard Ubuntu binary is known to cause problems on certain old hardware and in
certain virtualized environments. If you experience errors like "Illegal instruction (core
dumped)", install the  ubuntu-x86_64-generic  version instead, which is compiled speci?cally to

be compatible with almost all physical and virtual x86-64 CPUs.

Correct Sui network con?guration

If you get an error like "the speci?ed Walrus system object does not exist", make sure your
wallet is set up for the correct Sui network (Mainnet or Testnet as you may require) and you
use the latest con?guration.

Latest Walrus con?guration

The Walrus Testnet is wiped periodically and requires updating to the latest binary and
con?guration. If you get an error like "could not retrieve enough con?rmations to certify the
blob", you are probably using an outdated con?guration pointing to an inactive Walrus system.

https://docs.wal.app/print.html

102/209

7/28/25, 9:22 PM

Walrus

In this case, update your con?guration ?le with the latest con?guration and make sure the CLI
uses the intended con?guration.

Tip

When setting  RUST_LOG=info , the  walrus  client binary prints information about the used

con?guration when starting execution, including the path to the Walrus con?guration ?le
and the Sui wallet.

https://docs.wal.app/print.html

103/209

7/28/25, 9:22 PM

Walrus

Introduction to Walrus Sites

Walrus Sites are "web"-sites that use Sui and Walrus as their underlying technology. They are a
prime example of how Walrus can be used to build new and exciting decentralized
applications. Anyone can build and deploy a Walrus Site and make it accessible to the world!
Interestingly, this documentation is itself available as a Walrus Site at

https://docs.wal.app/walrus-sites/intro.html (if you aren't there already).

At a high level, here are some of the most exciting features:

Publishing a site does not require managing servers or complex con?gurations; just
provide the source ?les (produced by your favorite web framework), publish them to
Walrus Sites using the site-builder tool, and you are done!
Sites can be linked to from ordinary Sui objects. This feature enables, for example,
creating an NFT collection in which every single NFT has a personalized website dedicated to
it.
Walrus Sites are owned by addresses on Sui and can be exchanged, shared, and updated
thanks to Sui's ?exible programming model. This means, among other things, that Walrus
Sites can leverage the SuiNS naming system to have human-readable names. No more
messing around with DNS!
Thanks to Walrus's decentralization and extremely high data availability, there is no risk of
having your site wiped for any reason.
Since they live on Walrus, these sites cannot have a backend in the traditional sense, and
can therefore be considered "static" sites. However, the developer can integrate with Sui-
compatible wallets and harness Sui's programmability to add backend functionality to
Walrus Sites!

Show me

To give you a very high-level view of how Walrus Sites work, let's look at an example: A simple
NFT collection on Sui that has a frontend dApp to mint the NFTs hosted on Walrus Sites, and in
which each NFT has a speci?c, personalized Walrus Site.

You can check out the mint page at https://?atland.wal.app/. This site is served to your browser
through the Walrus Site portal https://wal.app. While the portal's operation is explained in a
later section, consider for now that there can be many portals (hosted by whoever wants to
have their own, and even on  localhost ). Further, the only function of the portal is to retrieve

the metadata (from Sui) and the resource ?les (from Walrus) that constitute the site.

https://docs.wal.app/print.html

104/209

7/28/25, 9:22 PM

Walrus

If you have a Sui wallet with some SUI, you can try and "mint a new Flatlander" from the site.
This creates an NFT from the collection and shows you two links: one to the explorer, and one
to the "Flatlander site". This latter site is a special Walrus Sites page that exists only for that
NFT, and has special characteristics (the background color, the image, ...) that are based on the
contents of the NFT.

The URL to this per-NFT site looks something like this:

https://flatland.wal.app/0x811285f7bbbaad302e23a3467ed8b8e56324ab31294c27d7392dac649

b215716 . You'll notice that the domain remains  wal.app , but the path is a long and random-

looking string. This string is actually the hexadecimal encoding of the object ID of the NFT,
which is 0x811285f7b.... This path is unique to each NFT and is used to fetch the metadata and
resource ?les for its corresponding page. The page is then rendered based on the
characteristics of the NFT.

In summary:

Walrus Sites are served through a portal; in this case,  https://wal.app . There can be
many portals, and anyone can host one.
The subdomain on the URL points to a speci?c object on Sui that allows the browser to
fetch and render the site resources. This pointer should be a SuiNS name, such as
flatland  in  https://flatland.wal.app .

It is possible for each path to be mapped to a speci?c object on Sui that allows the
browser to fetch and render a page based on the characteristics of the NFT.

Curious to know how this magic is possible? Read the technical overview! If you just want to get
started trying Walrus Sites out, check the tutorial.

https://docs.wal.app/print.html

105/209

7/28/25, 9:22 PM

Walrus

Your ?rst Walrus Site

This tutorial walks you through the steps necessary to publish a Walrus Site. We also provide
the instructions on how to add a SuiNS name to it for convenient browsing.

https://docs.wal.app/print.html

106/209

7/28/25, 9:22 PM

Walrus

Installing the site builder

This section describes the steps necessary to setup the Walrus Sites'  site-builder  tool and

prepare your environment for development.

Prerequisites

Before you start, make sure you

have a recent version of Rust installed;
followed all Walrus setup instructions.

Then, follow these additional setup steps.

Installation

Similar to the  walrus  client CLI tool, we currently provide the  site-builder  client binary for
macOS (Intel and Apple CPUs), Ubuntu, and Windows:

Mainnet Binaries

OS

CPU

Architecture

Ubuntu

Intel 64bit

site-builder-mainnet-latest-ubuntu-x86_64

MacOS

MacOS

Apple Silicon

site-builder-mainnet-latest-macos-arm64

Intel 64bit

site-builder-mainnet-latest-macos-x86_64

Windows

Intel 64bit

site-builder-mainnet-latest-windows-x86_64.exe

Testnet Binaries

OS

CPU

Architecture

Ubuntu

Intel 64bit

site-builder-testnet-latest-ubuntu-x86_64

MacOS

MacOS

Apple Silicon

site-builder-testnet-latest-macos-arm64

Intel 64bit

site-builder-testnet-latest-macos-x86_64

https://docs.wal.app/print.html

107/209

7/28/25, 9:22 PM

OS

CPU

Walrus

Architecture

Windows

Intel 64bit

site-builder-testnet-latest-windows-x86_64.exe

Windows

We now o?er a pre-built binary also for Windows. However, most of the remaining
instructions assume a UNIX-based system for the directory structure, commands, etc. If you
use Windows, you may need to adapt most of those.

You can download the latest build from our Google Cloud Storage (GCS) bucket (correctly
setting the  $SYSTEM  variable):

Mainnet curl request

SYSTEM= # set this to your system: ubuntu-x86_64, ubuntu-x86_64-generic, macos-
x86_64, macos-arm64, windows-x86_64.exe
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-mainnet-
latest-$SYSTEM -o site-builder
chmod +x site-builder

Testnet curl request

SYSTEM= # set this to your system: ubuntu-x86_64, ubuntu-x86_64-generic, macos-
x86_64, macos-arm64, windows-x86_64.exe
curl https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-
latest-$SYSTEM -o site-builder
chmod +x site-builder

To be able to run it simply as  site-builder , move the binary to any directory included in your
$PATH  environment variable. Standard locations are  /usr/local/bin/ ,  $HOME/bin/ , or
$HOME/.local/bin/ .

Note

The site builder will look for the default con?guration ?le  sites-config.yaml  in the current

directory, the  $XDG_HOME/walrus/sites-config.yaml  and  $HOME/walrus/sites-
config.yaml  directory. In case you want to use explicitly a di?erent  sites-config.yaml ,
use the  --config  ?ag to specify the path to the con?guration ?le.

https://docs.wal.app/print.html

108/209

7/28/25, 9:22 PM

Walrus

Once this is done, you should be able to simply type  site-builder  in your terminal.

$ site-builder
Usage: site-builder [OPTIONS] <COMMAND>

Commands:
  publish  Publish a new site on Sui
  update   Update an existing site
  convert  Convert an object ID in hex format to the equivalent Base36
               format
  sitemap  Show the pages composing the Walrus site at the given object ID
  help     Print this message or the help of the given subcommand(s)

  ?

Con?guration

The  site-builder  tool needs a con?guration ?le to work. This ?le is called  sites-
config.yaml  and looks like this:

https://docs.wal.app/print.html

109/209

7/28/25, 9:22 PM

Walrus

contexts:
  testnet:
    # module: site
    # portal: wal.app
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
    staking_object:
0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    general:
       wallet_env: testnet
       walrus_context: testnet # Assumes a Walrus CLI setup with a multi-config
containing the "testnet" context.
       walrus_package:
0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66
       # wallet_address: 0x1234...
       # rpc_url: https://fullnode.testnet.sui.io:443
       # wallet: /path/to/.sui/sui_config/client.yaml
       # walrus_binary: /path/to/walrus
       # walrus_config: /path/to/testnet/client_config.yaml
       # gas_budget: 500000000
  mainnet:
    # module: site
    # portal: wal.app
    package: 0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27
    staking_object:
0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
    general:
       wallet_env: mainnet
       walrus_context: mainnet # Assumes a Walrus CLI setup with a multi-config
containing the "mainnet" context.
       walrus_package:
0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77
       # wallet_address: 0x1234...
       # rpc_url: https://fullnode.mainnet.sui.io:443
       # wallet: /path/to/.sui/sui_config/client.yaml
       # walrus_binary: /path/to/walrus
       # walrus_config: /path/to/mainnet/client_config.yaml
       # gas_budget: 500000000

default_context: mainnet

As you can see, the con?guration ?le is quite simple. You can de?ne here di?erent contexts and
their con?gurations, with just the package id ?eld being the mandatory one, representing the
Sui object ID of the Walrus Sites smart contract. You can ?nd the latest version of the package

in the Walrus Sites repository on the  mainnet  branch.

Walrus Sites stable branch

The stable branch of Walrus Sites is  mainnet . Make sure that you always pull the latest
changes from there.

https://docs.wal.app/print.html

110/209

7/28/25, 9:22 PM

Walrus

You can de?ne the location of the  sites-config.yaml  ?le using the  --config  ?ag when
running the  site-builder  commands like so:

site-builder --config /path/to/sites-config.yaml publish <build-directory-of-a-
site>

However, if are not a fan of repeating the same ?ags over and over, it's always easier to have

the con?guration ?le in one of the default locations.

Download the  sites-config.yaml  ?le from the repository, and place it in one of the
aforementioned default locations. To illustrate, we will use the  ~/.config/walrus  directory,

like so:

curl https://raw.githubusercontent.com/MystenLabs/walrus-
sites/refs/heads/mainnet/sites-config.yaml -o ~/.config/walrus/sites-config.yaml

You are now ready to start working on your Walrus Sites! ?

https://docs.wal.app/print.html

111/209

7/28/25, 9:22 PM

Walrus

Publishing a Walrus Site

Now that everything is installed and con?gured, you should be able to start publishing your
?rst Walrus Site!

Select the source material for the site

The  site-builder  works by uploading a directory of ?les produced by any web framework to

Walrus and adding the relevant metadata to Sui. This directory should have a ?le called
index.html  in its root, which will be the entry point to the Walrus Site.

There is a very useful example-Walrus-sites repository that contains multiple kinds of sites that
you can use for reference.

For simplicity, we will start by publishing the most frugal of the sites, the  walrus-snake  game.

First, clone the repository of the examples:

git clone https://github.com/MystenLabs/example-walrus-sites.git && cd example-
walrus-sites

Publish the site

Since we have placed the  walrus  and  site-builder  binaries and con?guration in their default

locations, publishing the  ./walrus-snake  site is as simple as calling the publishing command:

site-builder deploy ./walrus-snake --epochs 1

Tip

Depending on the network, the duration of an epoch may vary. Currently on Walrus
Testnet, the duration of an epoch is one day. On Mainnet, the duration of an epoch is two
weeks.

The end of the output should look like the following:

https://docs.wal.app/print.html

112/209

7/28/25, 9:22 PM

Walrus

Execution completed
Resource operations performed:
  - created resource /.DS_Store with blob ID
PwNzE9_a9anYb8AZysafQZGqd4h0scsTGhzF2GPsWmQ
  - created resource /Oi-Regular.ttf with blob ID
KUTTV_95_c68oQhaRP97tDPOYu0vqCWiGL7mzOq1faU
  - created resource /file.svg with blob ID oUpm044qBN1rkyIJYvMB4dUj6bRe3QEvJAN-
cvlIFmk
  - created resource /index.html with blob ID AR03hvxSlyfYl-
7MhXct4y3rnIIGPHdnjiIF03BK_XY
  - created resource /walrus.svg with blob ID xK8K1Q5khrl3eBT4jEiB-
L_gyShEIOVWti8DcAoEjtw
The site routes were modified

Created new site: test site
New site object ID:
0xe674c144119a37a0ed9cef26a962c3fdfbdbfd86a3b3db562ee81d5542a4eccf
To browse the site, you have the following options:
        1. Run a local portal, and browse the site through it: e.g.
http://5qs1ypn4wn90d6mv7d7dkwvvl49hdrlpqulr11ngpykoifycwf.localhost:3000
           (more info: https://docs.wal.app/walrus-sites/portal.html#running-the-
portal-locally)
        2. Use a third-party portal (e.g. wal.app), which will require a SuiNS
name.
           First, buy a SuiNS name at suins.io (e.g. example-domain), then point
it to the site object ID.
           Finally, browse it with: https://example-domain.wal.app

Note

Keep in mind that option 2 is only available on  mainnet .

This output tells you that, for each ?le in the folder, a new Walrus blob was created, and the
respective blob ID. Further, it prints the object ID of the Walrus Site object on Sui (so you can
have a look in the explorer and use it to set the SuiNS name) and, ?nally, the URL at which you
can browse the site. The deploy command will also save this new Site Object ID to the ws-
resources.json

Note here that we are implicitly using the default  sites-config.yaml  as the con?g for the site
builder that we set up previously on the installation section. The con?guration ?le is necessary

to ensure that the  site-builder  knows the correct Sui package for the Walrus Sites logic.

More details on the con?guration of the  site-builder  can be found under the advanced

con?guration section.

https://docs.wal.app/print.html

113/209

7/28/25, 9:22 PM

Walrus

Update the site

Let's say now you want to update the content of the site, for example by changing the title from
"eat all the blobs!" to "Glob all the Blobs!".

First, make this edit on in the  ./walrus-snake/index.html  ?le.

Then, you can update the existing site by running the  deploy  command again. The deploy

command will use the Site Object ID stored in ws-resources.json (from the initial deployment)
to identify which site to update. You do not need to specify the object ID manually:

site-builder deploy --epochs 1 ./walrus-snake

The output this time should be:

Execution completed
Resource operations performed:
  - deleted resource /index.html with blob ID
LVLk9VSnBrEgQ2HJHAgU3p8IarKypQpfn38aSeUZzzE
  - created resource /index.html with blob ID
pcZaosgEFtmP2d2IV3QdVhnUjajvQzY2ev8d9U_D5VY
The site routes were left unchanged

Site object ID: 0xe674c144119a37a0ed9cef26a962c3fdfbdbfd86a3b3db562ee81d5542a4eccf
To browse the site, you have the following options:
        1. Run a local portal, and browse the site through it: e.g.
http://2ql9wtro4xf2x13pm9jjeyhhfj28okawz5hy453hkyfeholy6f.localhost:3000
           (more info: https://docs.wal.app/walrus-sites/portal.html#running-the-
portal-locally)
        2. Use a third-party portal (e.g. wal.app), which will require a SuiNS
name.
           First, buy a SuiNS name at suins.io (e.g. example-domain), then point
it to the site object ID.
           Finally, browse it with: https://example-domain.wal.app

Compared to the when the site was ?rst published, we can see that now the only actions
performed were to delete the old  index.html , and update it with the newer one.

Browsing to the provided URL should re?ect the change. You've updated the site!

Note

The wallet you are using must be the owner of the Walrus Site object to be able to update it.

https://docs.wal.app/print.html

114/209

7/28/25, 9:22 PM

Walrus

Extending the expiration date of an existing site

To extend the expiration date of a previously-stored site, use the  update  command with

the  --check-extend  ?ag. With this ?ag, the site-builder will force a check of the status of all
the Walrus blobs composing the site, and will extend the ones that expire before  --epochs

epochs. This is useful to ensure all the resources in the site are available for the same
amount of epochs.

https://docs.wal.app/print.html

115/209

7/28/25, 9:22 PM

Walrus

Set a SuiNS name

Note

Browsing sites with b36 subdomains (e.g.
https://1lupgq2auevjruy7hs9z7tskqwjp5cc8c5ebhci4v57qyl4piy.wal.app ) is no longer
possible using the  wal.app  portal. B36 subdomains are still supported if you use a local

server, or an alternative portal.

To browse walrus sites using the  wal.app  portal, please use SuiNS names instead. ``

Walrus Sites require to use SuiNS names (this is like DNS for Sui) to assign a human-
readable name to a Walrus Site. To do so, you simply have to get a SuiNS name you like,
and point it to the object ID of the Walrus Site (as provided by the  publish  or  update
commands).

Let's do this step by step.

Get a SuiNS name

Navigate to https://suins.io (mainnet) or https://testnet.suins.io (testnet) and buy a
domain name with your wallet. For example,  walrusgame  (this speci?c one is already
taken, choose another you like).

At the moment, you can only select names that are composed of letters `a-

z` and numbers `0-9`, but

no special characters (e.g., `-`).

Map the SuiNS name to the Walrus Site

Now, you can set the SuiNS name to point to the address of your Walrus Site. To do so, go to
the "names you own" section at SuiNS.io or Testnet.SuiNS.io for Testnet, click on the "three
dots" menu icon above the name you want to map, and click "Link To Walrus Site". Paste in the
bar the object ID of the Walrus Site, check that it is correct, and click "Apply".

https://docs.wal.app/print.html

116/209

7/28/25, 9:22 PM

Walrus

After approving the transaction, we can now browse https://walrusgame.wal.app!

Backwards compatibility

If you previously linked a SuiNS domain to a Walrus Site, you might recall clicking the "Link
To Wallet Address" button instead of the "Link To Walrus Site" button. These old links
remain valid, but we recommend using the procedure above for all new sites and updates
to older sites. The portal will ?rst check if the domain is linked using the "Link to Walrus
Site", and, if that is not set, it will fall back to checking the "Link to Wallet Address".

https://docs.wal.app/print.html

117/209

7/28/25, 9:22 PM

Walrus

Advanced functionality

Keep reading to learn about the advanced features of Walrus Sites, including con?guring the
site builder, specifying headers and routing for site resources, and redirecting Sui objects to
Walrus Sites to create per-object websites!

https://docs.wal.app/print.html

118/209

7/28/25, 9:22 PM

Walrus

Site builder commands

We now describe in more detail the commands available through the site builder.

Tip

In general, the  --help  ?ag is your friend, you can add it to get further details for the whole
CLI ( site-builder --help ) or individual commands (e.g.  site-builder update --help ).

deploy

The  deploy  command is the primary and recommended command for managing your Walrus

Site on Sui. The command takes a directory as input and creates a new Walrus Site from the
resources contained within, and on subsequent calls, it updates the existing site.

Behavior

The deploy command determines whether to publish a new site or update an existing one by
looking for a Site Object ID. It ?nds the ID with the following priority:

An ID provided directly via the  --object-id <OBJECT_ID>  command-line ?ag.
An ID found in the object_id ?eld of the ws-resources.json ?le.
If no ID is found by either method, deploy will publish a new site.

When a new site is published, its object_id is automatically saved back to  ws-resources.json ,

streamlining future updates.

Usage

As shown by the command's help information, the typical usage is:

site-builder deploy [OPTIONS] --epochs <EPOCHS> <DIRECTORY>

The  deploy  command determines whether to publish or update based on the presence of an
object_id  ?eld in the  ws-resources.json  ?le. specifying headers and routing.

https://docs.wal.app/print.html

119/209

7/28/25, 9:22 PM

Info

Walrus

The  object_id  ?eld is automatically set by the  deploy  command, when deploying a new
site, so there is no need for manually tracking the Site's Object ID.

Note

The wallet you are using to update an existing Site must be the owner of the Walrus Site

object to be able to update it.

The  --epochs  ?ag speci?es the number of epochs for which the site's resources will be stored
on Walrus (e.g., 10). You can also use max to store for the maximum allowed duration.

Warning

The  --epochs  ?ag is required & it's value must be greater than 0.

Epoch duration on Walrus

On Walrus Testnet, the epoch duration is one day. On Walrus Mainnet, the epoch duration

is fourteen days. Therefore, consider storing your site for a large number of epochs if you
want to make it available for the following months! The maximum duration is set to 53
epochs.

If you are just uploading raw ?les without an  index.html , you may want to use the  --list-

directory  ?ag, which will automatically create an index page to browse the ?les. See for

example https://bin.wal.app.

Migrating from publish/update

If you have a site that was previously managed with the  publish  and  update  commands, you

can easily switch to the  deploy  command using one of the following methods:

Recommended: Use the  --object-id  cli ?ag Simply run the  deploy  command and
provide your existing Site's Object ID via the  --object-id  ?ag:

https://docs.wal.app/print.html

120/209

7/28/25, 9:22 PM

Walrus

site-builder deploy --object-id <YOUR_EXISTING_SITE_ID> --epochs <NUMBER>
./path/to/your/site

On success, this will update your site and automatically create (or update if already existing) a
ws-resources.json  ?le with the Site's Object ID saved in the  object_id  ?eld. Future
deployments will then be as simple as:

site-builder deploy --epochs <NUMBER> ./path/to/your/site

Manual  ws-resources.json  setup. You can manually create or update a  ws-

resources.json  ?le in your site's root directory and add the  object_id  ?eld with your
existing site's Object ID.

{
  "object_id": "0x123...abc"
}

Then, you can simply run:

site-builder deploy --epochs <NUMBER> ./path/to/your/site

publish

Note

The  deploy  command is the new standard for publishing and updating your Walrus Sites.

Users are encouraged to migrate to the  deploy  command for a simpler and more robust

experience.

The  publish  command, as described in the previous section, publishes a new site on Sui. The
command takes a directory as input and creates a new Walrus Site from the resources
contained within.

The  --epochs  ?ag allows you to specify for how long the site data will be stored on Walrus.

https://docs.wal.app/print.html

121/209

7/28/25, 9:22 PM

Walrus

Epoch duration on Walrus

On Walrus Testnet, the epoch duration is one day. On Walrus Mainnet, the epoch duration
is fourteen days. Therefore, consider storing your site for a large number of epochs if you
want to make it available for the following months! The maximum duration is set to 53
epochs.

If you are just uploading raw ?les without an  index.html , you may want to use the  --list-

directory  ?ag, which will automatically create an index page to browse the ?les. See for
example https://bin.wal.app.

The  publish  command will also respect the instructions in the  ws-resources.json

con?guration ?le. To know more, see the section on specifying headers and routing.

update

Note

The  deploy  command is the new standard for publishing and updating your Walrus Sites.
Users are encouraged to migrate to the  deploy  command for a simpler and more robust
experience.

This command is the equivalent of  publish , but for updating an existing site. It takes the same

arguments, with the addition of the Sui object ID of the site to update.

Note

The wallet you are using to call  update  must be the owner of the Walrus Site object to be

able to update it.

convert

The  convert  command converts an object ID in hex format to the equivalent Base36 format.
This command is useful if you have the Sui object ID of a Walrus Site, and want to know the

https://docs.wal.app/print.html

122/209

7/28/25, 9:22 PM

Walrus

subdomain where you can browse it.

site-map

The  sitemap  command shows the resources that compose the Walrus Site at the given object
ID.

list-directory

With  list-directory , you can obtain the  index.html  ?le that would be generated by running

publish  or  update  with the  --list-directory  ?ag. This is useful to see how the index page

would look like before publishing itùand possibly editing to make it look nicer!

destroy

Destroys both blockchain objects and Walrus assets of a site with the given object id.

update-resource

Adds or updates a single resource in a site, eventually replacing any pre-existing ones.

https://docs.wal.app/print.html

123/209

7/28/25, 9:22 PM

Walrus

Con?guring the site builder

Con?guring the  site-builder  tool is straightforward, but care is required to ensure that

everything works correctly.

The  site-builder  tool requires a con?guration ?le to know which package to use on Sui,
which wallet to use, the gas budget, and other operational details. Most of these are abstracted

away through sensible defaults, so you should not need to touch them. Yet, for completeness,
we provide here the details for all the con?guration options.

Minimal con?guration

The con?g ?le is expected to be in one of the default locations, and it is possible to point
elsewhere with the  --config  ?ag. For your ?rst run, it should be su?cient to call the  site-
builder  without specifying the con?g explicitly, which is already con?gured if you followed

thoroughly the installation steps.

If, for any reason, you didn't add  walrus  to  $PATH , make sure to con?gure a pointer to the

binary, see below.

Additional options

If you want to have more control over the behavior of the site builder, you can customize the
following variables in the con?g ?le:

package : the object ID of the Walrus Sites package on Sui. This must always be speci?ed

in the con?g, and is already appropriately con?gured in  ./sites-config.yaml .
portal : the name of the portal through which the site will be viewed; this only a?ects the

output of the CLI, and nothing else (default:  wal.app ). All Walrus Sites are accessible
through any portal independent of this setting.
general : these are general options that can be con?gured both through the CLI and the

con?g:

rpc_url : The URL of the Sui RPC node to use. If not set, the  site-builder  will infer
it from the wallet.
wallet : Pointer to the Sui wallet to be used. By default, it uses the system-wide

wallet (the one from  sui client addresses ).

https://docs.wal.app/print.html

124/209

7/28/25, 9:22 PM

Walrus

walrus_binary : Pointer to the  walrus  binary. By default, this is expected to be run
from  $PATH .
walrus_config : The con?guration for the  walrus  client binary, see the relevant

chapter.
gas_budget : The maximum amount of gas to be spent for transactions (default:

500M MIST).

Note

From time to time there are package upgrades happening. This will require you to update
the  package  ?eld in the con?g ?le.

https://docs.wal.app/print.html

125/209

7/28/25, 9:22 PM

Walrus

Specifying headers, routing, and metadata

In its base con?guration, Walrus Sites serves static assets through a portal. However, many
modern web applications require more advanced features, such as custom headers and client-
side routing.

Therefore, the site-builder can read a  ws-resource.json  con?guration ?le, in which you can

directly specify resource headers and routing rules.

The ws-resources.json ?le

This ?le is optionally placed in the root of the site directory, and it is not uploaded with the site's
resources (in other words, the ?le is not part of the resulting Walrus Site and is not served by
the portal).

If you don't want to use this default location, you can specify the path to the con?guration ?le

with the  --ws-resources  ?ag when running the  deploy ,  publish  or  update  commands.

The ?le is JSON-formatted, and looks like the following:

{
  "headers": {
    "/index.html": {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "max-age=3500"
    }
  },
  "routes": {
    "/*": "/index.html",
    "/accounts/*": "/accounts.html",
    "/path/assets/*": "/assets/asset_router.html"
  },
  "metadata": {
      "link": "https://subdomain.wal.app",
      "image_url": "https://www.walrus.xyz/walrus-site",
      "description": "This is a walrus site.",
      "project_url": "https://github.com/MystenLabs/walrus-sites/",
      "creator": "MystenLabs"
  },
  "site_name": "My Walrus Site",
  "object_id":
"0xe674c144119a37a0ed9cef26a962c3fdfbdbfd86a3b3db562ee81d5542a4eccf",
  "ignore": ["/private/*", "/secret.txt", "/images/tmp/*"]
}

https://docs.wal.app/print.html

126/209

7/28/25, 9:22 PM

Note

Walrus

The  ws-resources.json  ?le, expects the ?eld names to be in  snake_case

We now describe in detail six sections of the con?guration ?le:  headers ,  routes ,  metadata ,

site_name ,  object_id  and the  ignore  section.

Specifying HTTP response headers

The  headers  section allows you to specify custom HTTP response headers for speci?c
resources. The keys in the  headers  object are the paths of the resources, and the values are

lists of key-value pairs corresponding to the headers that the portal will attach to the response.

For example, in the con?guration above, the ?le  index.html  will be served with the  Content-
Type  header set to  text/html; charset=utf-8  and the  Cache-Control  header set to  max-

age=3500 .

This mechanism allows you to control various aspects of the resource delivery, such as caching,
encoding, and content types.

Note

The resource path is always represented as starting from the root  / .

Default headers

By default, no headers need to be speci?ed, and the  ws-resources.json  ?le can be omitted.
The site-builder will automatically try to infer the  Content-Type  header based on the ?le

extension, and set the  Content-Encoding  to  identity  (no transformation).

In case the content type cannot be inferred, the  Content-Type  will be set to

application/octet-stream .

These defaults will be overridden by any headers speci?ed in the  ws-resources.json  ?le.

https://docs.wal.app/print.html

127/209

7/28/25, 9:22 PM

Walrus

Specifying client-side routing

The  routes  section allows you to specify client-side routing rules for your site. This is useful
when you want to use a single-page application (SPA) framework, such as React or Angular.

The con?guration in the  routes  object is a mapping from route keys to resource paths.

The  routes  keys are path patterns in the form  /path/to/some/* , where the  *  character
represents a wildcard.

Note

Currently, the wildcard can only be speci?ed at the end of the path. Therefore,  /path/*  is a

valid path, while  /path/*/to  and  */path/to/*  are not.

The  routes  values are the resource paths that should be served when the route key is
matched.

Important

The paths in the values must be valid resource paths, meaning that they must be present
among the site's resources. The Walrus sites contract will abort if the user tries to create a
route that points to a non-existing resource.

The simple routing algorithm is as follows:

Whenever a resource path is not found among the sites resources, the portal tries to match
the path to the  routes .

All matching routes are then lexicographically ordered, and the longest match is chosen.
The resource corresponding to this longest match is then served.

Note

In other words, the portal will always serve a resource if present, and if not present will

serve the resource with the longest matching pre?x among the routes.

Recall the example above:

https://docs.wal.app/print.html

128/209

7/28/25, 9:22 PM

Walrus

"routes": {
  "/*": "/index.html",
  "/path/*": "/accounts.html",
  "/path/assets/*": "/assets/asset_router.html"
}

The following matchings will occur:

browsing  /any/other/test.html  will serve  /index.html ;
browsing  /path/test.html  will serve  /accounts.html , as it is a more speci?c match than

the previous one;
similarly, browsing  /path/assets/test.html  will serve  /assets/asset_router.html .

/index.html ,  /accounts.html , and  /assets/asset_router.html  are all existing resources on
the Walrus Sites object on Sui.

Displaying the Site Object on Wallets and Explorers

It's possible to make your Site object prettier by displaying information about it on Sui

explorers and wallets by using the  metadata  ?eld. This is useful for adding human-readable
information about the site. For example, you can add a link to your site's homepage, an image
of your site's logo, etc.

As you can see from the example above, the ?elds correspond to the basic set of properties
suggested by the Sui Display object standard.

"metadata": {
      "link": "https://subdomain.wal.app",
      "image_url": "https://www.walrus.xyz/walrus-site",
      "description": "This is a walrus site.",
      "project_url": "https://github.com/MystenLabs/walrus-sites/",
      "creator": "MystenLabs"
  }

All metadata ?elds are optional, and can be omitted if not needed. There are some default
values speci?ed in the site-builder CLI, which can be overridden by the user.

It is recommended to use the above ?elds like this:

link : Add a link to your site's homepage.
image_url : Include a URL to your site's logo which will be displayed on your wallet. For

example you can place a link to your sites favicon.
description : Add a brief description of your site.

https://docs.wal.app/print.html

129/209

7/28/25, 9:22 PM

Walrus

project_url : If your site is open-source, add a link to your site's GitHub repository.

creator : Add the name of your company, group, or individual creator of your site.

Site Name (site_name)

You can set a Name for your Walrus Site, via the optional  site_name  ?eld in your  ws-

resources.json  ?le.

Note

In case you have also provided a Site Name via the  --site-name  cli ?ag, the cli ?ag will take
priority over the  site_name  ?eld in the  ws-resources.json , which will be overwritten.

Note

If a Site Name is not provided at all (neither through the  --site-name  cli ?ag, nor through

the  site_name  ?eld in  ws-resources.json ), then a default name will be used.

Site Object ID (object_id)

The optional  object_id  ?eld in your  ws-resources.json  ?le stores the Sui Object ID of your

deployed Walrus Site.

Role in Deployment:

The  site-builder deploy  command primarily uses this ?eld to identify an existing site for
updates. If a valid  object_id  is present,  deploy  will target that site for modi?cations. If this

?eld is missing (and no  --object-id  CLI ?ag is used),  deploy  will publish a new site. If

successful, then the command automatically populates this  object_id  ?eld in your  ws-
resources.json .

https://docs.wal.app/print.html

130/209

7/28/25, 9:22 PM

Walrus

Ignoring ?les from being uploaded

You can use the optional  ignore  ?eld to exclude certain ?les or folders from being published.

This is useful when you want to keep development ?les, secrets, or temporary assets out of the
?nal build.

The  ignore  ?eld is a list of resource paths to skip. Each pattern must start with a  / , and may

end with a  *  to indicate a wildcard match.

For example:

"ignore": [
  "/private/*",
  "/secret.txt",
  "/images/tmp/*"
]

This con?guration will skip all ?les inside the  /private/  and  /images/tmp/  directories, as well

as a speci?c ?le  /secret.txt .

Wildcards are only supported in the last position of the path (e.g.,  /foo/*  is valid, but
/foo/*/bar  is not).

https://docs.wal.app/print.html

131/209

7/28/25, 9:22 PM

Walrus

Linking from and to Walrus Sites

Walrus Sites links are currently unavailable

This feature is currently unavailable on server-side portals. So if you are browsing a Walrus

Site on https://wal.app, you will not be able to use Walrus Sites links.

We are working on enabling this feature. Stay tuned!

Links in Walrus Sites work almost as you would expect in a regular website. We specify here a
few of the details.

Linking to resources within the same site

Relative and absolute links ( href="/path/to/resource.html" ) work as usual.

Linking to resources on the web

Linking to a resource on the web ( href="https://some.cdn.example.com/stylesheet.css" )

also works as usual.

Linking to resources in other Walrus Sites

Here is the part that is a bit di?erent. Assume there is some image that you can browse at
https://gallery.wal.app/walrus_arctic.webp , and you want to link it from your own Walrus
Site.

Recall that, however,  https://wal.app  is just one of the possibly many portals. I.e., the same

resource is browsable from a local portal
( http://gallery.localhost:8080/walrus_arctic.webp ). Therefore, how can you link the
resource in a portal-independent way? This is important for interoperability, availability, and
respecting the user's choice of portal.

https://docs.wal.app/print.html

132/209

7/28/25, 9:22 PM

Walrus

The solution: Walrus Sites links

Warning

This feature is only available for service-worker based portals.

We solve this problem by having the portals interpret special links that are normally invalid on
the web and redirect to the corresponding Walrus Sites resource in the portal itself.

Consider the example above, where the resource  /walrus_arctic.webp  is browsed from the

Walrus Site with SuiNS name  gallery , which points to the object ID  abcd123à  (in Base36
encoding). Then, the portal-independent link is:
https://gallery.suiobj/walrus_arctic.webp . To ?x the object ID instead of the SuiNS name,
you can use  https://abcd123à.suiobj/walrus_arctic.webp .

Another possibility is to directly point to the Walrus blob ID of the resource, and have the
browser "sni?" the content type. This works for images, for example, but not for script or
stylesheets. For example to point to the blob ID (e.g., containing an image)  qwer5678à , use the

URL  https://blobid.walrus/qwer5678à .

With such a link, the portal will extract the blob ID and redirect the request to the aggregator it

is using to fetch blobs.

https://docs.wal.app/print.html

133/209

7/28/25, 9:22 PM

Walrus

Redirecting objects to Walrus Sites

We have seen in the overview how a Walrus Site object on Sui looks like. We will discuss now
how you can create ensure that a set of arbitrary objects can all be tied to a speci?c, and
possibly unique, Walrus Site.

The goal

Consider a collection of NFTs, such as the one published by https://?atland.wal.app. As we
show there, each minted NFT has its own Walrus Site, which can be personalized based on the
contents (e.g., the color) of the NFT itself. How can we achieve this?

Redirect links

The solution is simple: We add a "redirect" in the NFT's  Display  property. Each time an NFT's

object ID is browsed through a portal, the portal will check the  Display  of the NFT and, if it
encounters the  walrus site address  key, it will go fetch the Walrus Site that is at the

corresponding object ID.

Redirects in Move

Practically speaking, when creating the  Display  of the NFT, you can include the key-value pair

that points to the Walrus Site that is to be used.

...
const VISUALIZATION_SITE: address = @0x901fb0...;
display.add(b"walrus site address".to_string(), VISUALIZATION_SITE.to_string());
...

How to change the site based on the NFT?

The code above will only open the speci?ed Walrus Site when browsing the object ID of the
NFT. How do we ensure that the properties of the NFT can be used to personalize the site?

https://docs.wal.app/print.html

134/209

7/28/25, 9:22 PM

Walrus

This needs to be done in the  VISUALIZATION_SITE : Since the subdomain is still pointing to the
NFT's object ID, the Walrus Site that is loaded can check its  origin  in JavaScript, and use the

subdomain to determine the NFT, fetch it from chain, and use its internal ?elds to modify the
displayed site.

For an end-to-end example, see the  flatland  repo.

https://docs.wal.app/print.html

135/209

7/28/25, 9:22 PM

Walrus

CI/CD

If you need to automate the deployment of your Walrus Sites, you can use a CI/CD pipeline.
This guide covers the essential steps to set up continuous deployment for your site.

Get started

Follow the below in order:

1. Preparing Your Deployment Credentials - Set up the necessary secrets and variables in

your GitHub repository

2. Writing your work?ow - Create and con?gure your GitHub Actions work?ow ?le

Additional Examples

You can ?nd more examples of GitHub work?ows here:

1. Work?ow for Deploying Walrus Documentation
2. Sui Potatoes Deployment Work?ow
3. Community-Driven Walrus Sites Provenance

https://docs.wal.app/print.html

136/209

7/28/25, 9:22 PM

Walrus

Preparing Your Deployment Credentials

To allow the GitHub Action to deploy your Walrus Site, it needs to be able to sign transactions
on your behalf. This requires securely providing it with your private key and the corresponding
public address.

This guide will show you how to:

1. Export a private key from your Sui Wallet or CLI.
2. Correctly format the key and add it as a  SUI_KEYSTORE  secret in your GitHub repository.
3. Add the matching public address as a  SUI_ADDRESS  variable in your GitHub repository.

Prerequisites

Before you start, you must have the  sui  binary installed. If you haven't installed it yet, please
follow the o?cial Sui installation guide.

Exporting Your Private Key

Best Practice: It's recommended to use a dedicated Sui address for each GitHub
work?ow rather than reusing addresses across di?erent projects or purposes. This
provides better security isolation and helps avoid gas-coin equivocation issues that can
occur when multiple work?ows try to use the same gas coins concurrently.

From Sui CLI

From Slush Wallet

To export a private key using the command line:

1. Generate a new key by running the following command in your terminal:

sui keytool generate ed25519 # Or secp256k1 or secp256r1

2. This command creates a ?le in your current directory named  <SUI_ADDRESS>.key  (e.g.,

0x123...abc.key ). The ?lename is your new Sui Address.

https://docs.wal.app/print.html

137/209

7/28/25, 9:22 PM

Walrus

3. The content of this ?le is the private key in the  base64WithFlag  format. This is the value

you need for the  SUI_KEYSTORE  secret.

4. You now have both the address (from the ?lename) for the  SUI_ADDRESS  variable and the

key (from the ?le's content) for the  SUI_KEYSTORE  secret.

Note on existing keys If you wish to use a key you already own, you can ?nd it in the
~/.sui/sui_config/sui.keystore  ?le. This ?le contains a JSON array of all your keys. To
?nd the address for a speci?c key, you would need to use the  sui keytool unpack "<the

base64 key from sui.keystore>"  command.

Funding Your Address

Before the GitHub Action can deploy your site, the address you generated needs to be funded
with both SUI tokens (for network gas fees) and WAL tokens (for storing your site's data). The
method for acquiring these tokens di?ers between Testnet and Mainnet.

Testnet Funding Mainnet Funding

1. Get SUI tokens: Use the o?cial Sui faucet to get free Testnet SUI.
2. Get WAL tokens: Exchange your new Testnet SUI for Testnet WAL at a 1:1 rate by running
the  walrus get-wal  command either using the  walrus get-wal  CLI command or visiting

stake-wal.wal.app setting network to Testnet and using the "Get WAL" button.

Adding credentials to GitHub

Now, let's add the key and address to your GitHub repository.

1. Navigate to your GitHub repository in a web browser.

2. Click on the Settings tab (located in the top navigation bar of your repository).

3. In the left sidebar, click Secrets and variables, then select Actions.

https://docs.wal.app/print.html

138/209

7/28/25, 9:22 PM

Walrus

4. You'll see two tabs: Secrets and Variables. Start with the Secrets tab.

5. Click the New repository secret button.

6. Name the secret  SUI_KEYSTORE .

7. In the Value ?eld, paste the  Base64 Key with Flag  you copied earlier. It must be

formatted as a JSON array containing a single string:

["AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"]

8. Click Add secret to save it.

Warning

Make sure to format the keystore as a JSON array with a single string element, not just

the raw key value. Include the square brackets and quotes exactly as shown above.

9. Next, switch to the Variables tab and click New repository variable.

10. Name the variable  SUI_ADDRESS .

11. In the Value ?eld, paste the Sui address that corresponds to your private key (for

example:  0x123abc...def789 ).

12. Click Add variable to save it.

Security reminder

Never share your private key or commit it to version control. GitHub secrets are encrypted
and only accessible to your work?ows, but always verify you're adding secrets correctly.

For more information about managing secrets and variables in GitHub Actions, check the
o?cial GitHub documentation:

About secrets
Using secrets in GitHub Actions

https://docs.wal.app/print.html

139/209

7/28/25, 9:22 PM

Walrus

Writing your work?ow

Now that you have con?gured your secrets and variables, you can create GitHub work?ows to
automate your Walrus Site deployments using the o?cial "Deploy Walrus Site" GitHub Action.

Key Requirement: Pre-built Site Directory

The Deploy Walrus Site action operates on an already built site directory. The action does not
build your site - it deploys existing static ?les to Walrus.

This means:

If your site consists of ready-to-deploy static ?les (HTML, CSS, JS), you can use the action
directly
If your site requires a build step (React, Vue, Svelte, etc.), you must include build steps in
your work?ow before calling the deploy action

Using the Deploy Walrus Site GitHub Action

The action ( MystenLabs/walrus-sites/.github/actions/deploy ) requires these inputs:

SUI_ADDRESS : Your Sui address (GitHub variable)
SUI_KEYSTORE : Your private key in base64 format (GitHub secret)
DIST : Path to your built site directory

Optional inputs include:

SUI_NETWORK : Target network ( mainnet  or  testnet , defaults to  mainnet )
EPOCHS : Number of epochs to keep the site stored (defaults to  5 )
WALRUS_CONFIG : Custom Walrus con?guration (downloads default if not provided)
SITES_CONFIG : Custom sites con?guration (downloads default if not provided)
WS_RESOURCES : Full path to the  ws-resources.json  ?le (defaults to  DIST/ws-
resources.json )
GITHUB_TOKEN : Enables automatic pull request creation when site resources change

https://docs.wal.app/print.html

140/209

7/28/25, 9:22 PM

About GITHUB_TOKEN

Walrus

The  GITHUB_TOKEN  input is particularly useful for tracking changes to your site's resources.
When you deploy a site, site-builder creates or updates a  ws-resources.json  ?le that tracks

the site's data. If this ?le changes during deployment, the action can automatically create a pull
request with the updated ?le.

To use this feature:

1. Set  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  in your work?ow

2. Add these permissions to your work?ow:

permissions:

  contents: write

  pull-requests: write

Note

If you don't provide the  GITHUB_TOKEN , the action will still deploy your site successfully but
won't create pull requests for resource ?le changes.

New Site vs Existing Site

Understanding how the work?ow behaves depends on whether you have an existing site:

New site (no existing  object_id ):

Creates a new Walrus Site on Sui.
Generates a  ws-resources.json  ?le in your  DIST  directory (or updates the ?le speci?ed
by  WS_RESOURCES ).

This ?le contains the  object_id  of your newly created site.
If  GITHUB_TOKEN  is provided with correct permissions, creates a pull request with these

changes.

Existing site (has  object_id ):

Uses the existing  object_id  from your Walrus-Sites resources ?le to update the same
site.
Only creates PRs if the resources ?le changes during deployment.

https://docs.wal.app/print.html

141/209

7/28/25, 9:22 PM

Walrus

This applies whether you've previously deployed using GitHub Actions or manually using
the CLI - as long as the  object_id  is present in your  WS_RESOURCES  ?le (defaults to
DIST/ws-resources.json )

Tip

The  ws-resources.json  ?le is crucial - it tells the action which site to update. Make sure to
merge the PR from the ?rst run so future deployments update the same site instead of
creating new ones.

Tip

Once your site is deployed and you have the  object_id , you can link it with a SuiNS name
to make your site accessible at  <suins>.wal.app . See Set a SuiNS name for details on how

to set this up.

Creating Your Work?ow

1. Create  .github/workflows/deploy-site.yml  in your repository
2. Add checkout step to get your repository ?les
3. If your site needs building, add build steps:

Add build environment setup (Node.js, etc.)
Add build commands

4. Set your  DIST  path:

For sites requiring build: Point to your build output directory (e.g.,  dist/ ,  build/ )
For static sites: Point directly to your static ?les directory

5. Add the Deploy Walrus Site action with your con?gured secrets and variables

The key is ensuring your  DIST  path points to a directory containing the ?nal, deployable static
?les that should be published to Walrus.

Example Work?ows

deploy-snake.yml - Simple static site deployment
deploy-vite-react-ts.yml - React application with build step

https://docs.wal.app/print.html

142/209

7/28/25, 9:22 PM

Walrus

For more information about creating and con?guring GitHub work?ows, check the o?cial
GitHub Actions documentation.

https://docs.wal.app/print.html

143/209

7/28/25, 9:22 PM

Walrus

Technical Overview

In the following sections, we delve deeper in the technical speci?cation of Walrus Sites.

High-level picture

Walrus Sites are enabled by Sui and Walrus. The resources of the Walrus Site ( html ,  css ,  js ,
images, etc.) are stored on Walrus, while the main entry point to it is an object stored on Sui,
which contains the metadata for the site and point to the Walrus blob IDs.

The Walrus Sites objects on Sui

A Walrus  Site  is represented on Sui as a very simple object:

struct Site has key, store {
    id: UID,
    name: String,
}

The resources associated with this site are then added to this object as dynamic ?elds of type
Resource :

struct Resource has store, drop {
    path: String,
    // The walrus blob id containing the bytes for this resource
    blob_id: u256,
    ?
}

Importantly, each resource contains:

the  path  of the resource, for example  /index.html  (all the paths are always represented
as starting from root  / );
the  blob_id , which is the Walrus blob ID where the resource can be found; and

additional ?elds, that will be explained later in the documentation.

These  Resource  dynamic ?elds are keyed with a struct of type  ResourcePath

https://docs.wal.app/print.html

144/209

7/28/25, 9:22 PM

Walrus

struct ResourcePath has copy, store, drop {
    path: String,
}

This struct just holds the string of the path ( /index.html ); having a separate type ensures that
we will not have namespace collisions with other dynamic ?elds, possibly added by other
packages.

To see this in action, look at a Walrus Site in the explorer, and check its dynamic ?elds.

The site rendering path

Given the Sui object ID of a Walrus Site, it is easy to look up the resources that compose it by

looking at the dynamic ?elds, and then fetch these resources from Walrus using the blob ID
contained in the  Resource  struct.

The only outstanding question is, therefore, how to perform these lookups on the client. A few
approaches are possible:

Having a server that accepts requests for a Sui object ID and possibly a path, and
performs this resolution on behalf of the client, serving back the resource as a standard
HTML Response.
Using a custom application on the client that has both a web browser and knowledge of
how Walrus Sites work, and can locally perform this resolution.
A hybrid approach based on service workers, where a service worker that is able to
perform the resolution is installed in the browser from a portal.

All of these approaches are viable (the ?rst has been used for similar applications in IPFS
gateways, for example), and have trade-o?s.

Currently, we provide the server-side and the service-worker based approaches.

Browsing and domain isolation

We must ensure that, when browsing multiple sites through a portal, for example the one
hosted at https://wal.app, these sites are isolated. Isolation is necessary for security, and to
ensure that the wallet connection in the browser works as expected.

To do so, we give each Walrus Site a speci?c subdomain of the portal's domain. For example,
the Flatland mint dApp is hosted at https://?atland.wal.app, where the subdomain  flatland  is
uniquely associated to the object ID of the Walrus Site through SuiNS.

https://docs.wal.app/print.html

145/209

7/28/25, 9:22 PM

Walrus

Walrus Sites also work without SuiNS: when a site is accessed through a self-hosted portal, or
through a portal that supports Base36 domain resolution, a site can be browsed by using as
subdomain the Base36 encoding of the Sui object ID of the site.

Danger

The  wal.app  portal does not support Base36 domain resolution; therefore,
https://58gr4pinoayuijgdixud23441t55jd94ugep68fsm72b8mwmq2.wal.app is not a valid
URL. If you want to access such a site, you should either use another portal or host your
own.

Base36 was chosen for two reasons, forced by the subdomain standards:

1. A subdomain can have at most 63 characters, while a Hex-encoded Sui object ID requires

64.

2. A subdomain is case insensitive, ruling out other popular encodings, e.g., Base64 or

Base58.

Walrus Site portals

Portal types

As mentioned before, we provide two types of portals to browse Walrus Sites:

The server-side portal, which is a server that resolves a Walrus Site, returning it to the
browser. The server-side portal is hosted at https://wal.app. This portal only supports

sites that are associated with a SuiNS name.
The service-worker portal, which is a service worker that is installed in the browser and
resolves a Walrus Site. The service-worker portal is no longer hosted at a speci?c domain,
but the code is still maintained so that it can be used by anyone.

We now show in greater detail how a Walrus Site is rendered in a client's browser using a

generic portal. Depending on the di?erent type of portal, some details may di?er, but the
general picture remains unchanged.

The end-to-end resolution of a Walrus Site

The steps below all reference the following ?gure:

https://docs.wal.app/print.html

146/209

7/28/25, 9:22 PM

Walrus

1/ Request dapp.wal.app
13/ Display dapp.wal.app

Browser Tab

User

.

.
l

p
p
a

e
s
n
o
p
s
e
r
n
r
u
e
R

a
w
p
p
a
d
T
E
G

/

t

2
1

/

2

7/ Request Walrus blob with blob ID(asdf...)

Portal (wal.app)
can be running in a
service worker or in a
server

Sui

5/ Fetch object 0x1234...
4/ Return ObjID "0x1234..."
3/ Resolve SuiNs "dapp.sui"

Full Node

6/ Return object (BCS bytes)
Contains blob ID (asdf...)

Object 0x1234...

Cache

Cache

Hit

11/ Return cached blob

Walrus

Metadata -> Blob
ID(asdf...)

Metadata -> Blob
ID(ghjk...)

l

b
o
b
e
h
c
a
C

/

0
1

8a/ Request ID(asdf...)

8b/ Return sliver

Storage Node 1

8a/ Request ID(asdf...)

8b/ Return sliver

Storage Node 2

0c/

Miss

Aggregator

Blob ID(asdf...)

dapp HTML

Blob ID(ghjk...)

dapp Images

9/ The Aggregator
reconstructs the blob
from the slivers

e
d
o
n
e
g
a
r
o
t
s

y
r
e
v
e
o

t

s
r
e
v

i
l

S

t

a
a
d
a
e
m
e

t

t
i
s
h
s

i
l

b
u
P

/

e
0

i

u
S
n
o
)
s
D

I

b
o
b
(

l

/
c
0

0d/ Return blob IDs (asdf...) (ghjk...)
0a/ Push website files to Walrus

Publisher

Website Dev

0b/ The publisher encodes
the blob into slivers and
reserves space for it on Sui

Site publishing (step 0): The site developer publishes the Walrus Site using the  site-

builder , or making use of a publisher. Assume the developer uses the SuiNS name
dapp.sui  to point to the object ID of the created Walrus Site.

Browsing starts (step 1): A client browses  dapp.wal.app/index.html  in their browser.

Site resolution (steps 2-6): The portal interprets its origin  dapp.wal.app , and makes a
SuiNS resolution for  dapp.sui , obtaining the related object ID. Using the object ID, it then
fetches the dynamic ?elds of the object (also checking redirects). From the dynamic ?elds,
it selects the one for  /index.html , and extracts its Walrus blob ID and headers (see the

advanced section on headers).
Blob fetch (steps 7-11): Given the blob ID, the portal queries a Walrus aggregator for the
blob data.
Returning the response (steps 12-13): Now that the portal has the bytes for
/index.html , and its headers, it can craft a response that is then rendered by the

browser.

https://docs.wal.app/print.html

147/209

7/28/25, 9:22 PM

Walrus

These steps are executed for all resources the browser may query thereafter (for example, if
/index.html  points to  assets/cat.png ).

The site builder

To facilitate the creation of Walrus Sites, we provide the "site builder" tool. The site builder
takes care of creating Walrus Sites object on Sui, with the correct structure, and stores the site
resources to Walrus. Refer to the tutorial for setup and usage instructions.

https://docs.wal.app/print.html

148/209

7/28/25, 9:22 PM

Walrus

The Walrus Sites portal

We use the term "portal" to indicate any technology that is used to access and browse Walrus
Sites. As mentioned in the overview, we foresee three kinds of portals:

1. server-side portals;
2. custom local apps; and
3. service-worker based portals running in the browser.

Currently, only a server-side portal is served at https://wal.app.

Warning

We are sunsetting the testnet portal! From now on, you can only access the mainnet portal
at https://wal.app.

Hosting of the service worker

The service-worker portal is no longer hosted, but you can still run it locally. Its code is
available in the  walrus-sites  repository. For more information, see running a local portal.

Walrus Sites stable branch

The stable branch of Walrus Sites is  mainnet .

Running a local portal

Running a portal locally can be useful, for example if you want to browse Walrus Sites without
accessing external portals, or for development purposes.

Let's start by cloning the  walrus-sites  repository:

git clone https://github.com/MystenLabs/walrus-sites.git
cd walrus-sites

Make sure you are on the stable branch:

https://docs.wal.app/print.html

149/209

7/28/25, 9:22 PM

Walrus

git checkout mainnet

Next, we will see how to con?gure the portal so it can support the functionality that we need.

Con?guration

Portal con?guration is managed through two key elements:

Environment variables: Required for basic functionality.
Constants ?le: Optional for advanced customization.

Environment Variables

The environment variables are set in the  .env.local  ?le at the root of each portal directory.
To just run a simple instance of a portal, you can use the environment variables speci?ed in the
.env.<network>.example  ?le:

Mainnet Server Portal Environment Variables

cp ./portal/server/.env.mainnet.example ./portal/server/.env.local

Testnet Server Portal Environment Variables

cp ./portal/server/.env.testnet.example ./portal/server/.env.local

Likewise, if you want to run the service-worker portal, you can copy the  .env.

<network>.example  ?le to  .env.local  in the  portal/worker  directory.

Mainnet Service Worker Portal Environment Variables

cp ./portal/worker/.env.mainnet.example ./portal/worker/.env.local

Testnet Service Worker Portal Environment Variables

cp ./portal/worker/.env.testnet.example ./portal/worker/.env.local

For a more detailed con?guration, you can modify the  .env.local  ?les to suit your needs. As a

reference, here are the de?nitions of the environment variables:

https://docs.wal.app/print.html

150/209

7/28/25, 9:22 PM

Note

Walrus

The server portal code contains additional functionality that can be enabled or disabled
using environment variables. For example, you can enable or disable the blocklist feature
by setting the  ENABLE_BLOCKLIST  variable to  true  or  false . This can be helpful to

manage the behavior of the portal. For example, if you host a publicly-accessible portal, you
might want to avoid serving sites that are not published by you.

AGGREGATOR_URL : The url to a Walrus aggregator that will fetch the site resources from

Walrus.

AMPLITUDE_API_KEY : Provide it if you want to enable Amplitude for your server analytics.

EDGE_CONFIG : If you host your portal on Vercel, you can use the Edge Con?g to blocklist
certain SuiNS subdomains or b36 object ids.

EDGE_CONFIG_ALLOWLIST : Similar to blocklist, but allows certain subdomains to use the

premium rpc url list.

ENABLE_ALLOWLIST : Enable the allowlist feature.

ENABLE_BLOCKLIST : Enable the blocklist feature.

ENABLE_SENTRY : Enable Sentry error tracking.

ENABLE_VERCEL_WEB_ANALYTICS : Enable Vercel web analytics.

LANDING_PAGE_OID_B36 : The b36 object id of the landing page Walrus Site. i.e. the page
you get when you visit  localhost:3000 .

PORTAL_DOMAIN_NAME_LENGTH : If you connect your portal with a domain name, specify the
length of the domain name. e.g.  example.com  has a length of 11.

PREMIUM_RPC_URL_LIST : A list of rpc urls that are used when a site belongs to the
allowlist.

RPC_URL_LIST : A list of rpc urls that are used when a site does not belong to the allowlist.

SENTRY_AUTH_TOKEN : If you enable Sentry error tracking, provide your Sentry auth token.

SENTRY_DSN : If you enable Sentry error tracking, provide your Sentry DSN.

SENTRY_TRACES_SAMPLE_RATE : If you enable Sentry error tracking, provide the sample rate
for traces.

https://docs.wal.app/print.html

151/209

7/28/25, 9:22 PM

Walrus

SITE_PACKAGE : The Walrus Site package id. Depending on the network you are using, you

will have to specify the correct package id.

SUINS_CLIENT_NETWORK : The network of the SuiNS client.

B36_DOMAIN_RESOLUTION_SUPPORT : De?ne if b36 domain resolution is supported.
Otherwise the site will not be served.

Constants

You can ?nd the  constants.ts  ?le in the  portal/common/lib  directory. It holds key
con?guration parameters for the portal. Typically, you won't need to modify these, but if you

do, here are the explanations for each parameter:

MAX_REDIRECT_DEPTH : The number of redirects the portal will follow before stopping.

SITE_NAMES : Hard coded  name: objectID  mappings, to override the SuiNS names. For

development only. Use this at your own risk, may render some sites with legitimate SuiNS
names unusable.

FALLBACK_PORTAL : This is related only to the service worker portal. The fallback portal

should be a server-side portal that is used in cases where some browsers do not support
service workers.

Deploying the Portal

To run the portal locally you can either use a Docker container or a local development
environment.

You can run the portal via Docker for a quick setup, or use a local development environment if
you want to modify the code or contribute to the project.

Docker

First, make sure you have Docker installed on your system.

docker --version

If it is not installed, follow the instructions on the Docker website.

Then, build the Docker image with:

https://docs.wal.app/print.html
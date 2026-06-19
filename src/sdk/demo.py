"""GridForge SDK — live demo.

Run this against the real API during the presentation:

    python demo.py

Fill in BASE_URL, GAME_ID and ITEM_ID with real values from your platform
before running (see the comments next to each one).
"""

from gridforge import GridForgeClient, GridForgeError

# ---- configure these before the demo ---------------------------------------
BASE_URL = "http://localhost:8000"          # server root, WITHOUT /api/v1
GAME_ID = "6b8ee6e7-cd71-4e79-b102-3a014e3485a8"
ITEM_ID = "cabce222-619e-4285-a7ec-77d05032569a"
# ----------------------------------------------------------------------------


def register_or_login(client, username, email, password):
    try:
        client.register(username, email, password)
        print(f"  registered {username}")
    except GridForgeError:
        client.login(email, password)
        print(f"  {username} already existed — logged in")


def main():
    alice = GridForgeClient(BASE_URL)
    bob = GridForgeClient(BASE_URL)
    carol = GridForgeClient(BASE_URL)

    print("1. Creating players...")
    register_or_login(alice, "alice", "alice@example.com", "secret123")
    register_or_login(bob, "bob", "bob@example.com", "secret123")
    register_or_login(carol, "carol", "carol@example.com", "secret123")

    print("2. handshake() — verify SDK is connected and authenticated...")
    print("  ", alice.handshake())

    print("3. me() — authenticated player info...")
    print("  ", alice.me())

    print("4. get_profile() — Alice's own profile...")
    print("  ", alice.get_profile())

    print("5. get_profile(player_id) — Alice views Bob's public profile...")
    bob_id = bob.get_profile()["id"]
    print("  ", alice.get_profile(player_id=bob_id))

    print("6. update_profile() — Alice updates her display name and bio...")
    print("  ", alice.update_profile(display_name="AliceTheGreat", bio="GG ez"))

    print("7. submit_score() — Alice submits a score...")
    alice.submit_score(GAME_ID, 9999)
    print("  done")

    print("8. get_my_progress() — all games Alice has progress in...")
    for p in alice.get_my_progress():
        print("  ", p)

    print("9. get_progress(game_id) — Alice's progress for this specific game...")
    print("  ", alice.get_progress(GAME_ID))

    print("10. get_leaderboard() — top 5 for this game...")
    for row in alice.get_leaderboard(GAME_ID, limit=5):
        print("  ", row)

    print("11. get_my_rank() — Alice's own rank...")
    print("  ", alice.get_my_rank(GAME_ID))

    print("12. add_to_inventory() — give Alice 2 items...")
    alice.add_to_inventory(ITEM_ID, quantity=2)
    print("  done")

    print("13. get_inventory() — Alice's inventory...")
    for item in alice.get_inventory():
        print("  ", item)

    print("14. send_gift() — Alice sends one item to Bob...")
    gift_to_bob = alice.send_gift(recipient_id=bob_id, item_id=ITEM_ID)
    print("  gift id:", gift_to_bob["id"])

    print("15. send_gift() — Alice sends one item to Carol...")
    carol_id = carol.get_profile()["id"]
    gift_to_carol = alice.send_gift(recipient_id=carol_id, item_id=ITEM_ID)
    print("  gift id:", gift_to_carol["id"])

    print("16. get_sent_gifts() — Alice's sent gifts...")
    for g in alice.get_sent_gifts():
        print("  ", g)

    print("17. get_inbox() — Bob's inbox...")
    for g in bob.get_inbox():
        print("  ", g)

    print("18. accept_gift() — Bob accepts the gift...")
    bob.accept_gift(gift_to_bob["id"])
    print("  done")

    print("19. get_inbox() — Carol's inbox...")
    for g in carol.get_inbox():
        print("  ", g)

    print("20. decline_gift() — Carol declines the gift...")
    carol.decline_gift(gift_to_carol["id"])
    print("  done")

    print("21. Bob's inventory after accepting gift...")
    for item in bob.get_inventory():
        print("  ", item)

    print("22. remove_from_inventory() — Bob removes the item...")
    bob.remove_from_inventory(ITEM_ID)
    print("  done")

    print("23. Bob's inventory after removal...")
    inv = bob.get_inventory()
    print("  ", inv if inv else "empty")

    print("24. get_ad_status() — Alice's ad state...")
    print("  ", alice.get_ad_status())

    print("25. logout() — Alice logs out...")
    alice.logout()
    print("  done")

    print("\nDemo complete — all methods tested.")


if __name__ == "__main__":
    try:
        main()
    except GridForgeError as e:
        print(f"\n[SDK error] {e}")

"""GridForge — Number Guessing Game

Demonstrates the GridForge SDK: login, score submission, leaderboard.

    python game.py
"""

import random
from gridforge import GridForgeClient, GridForgeError

BASE_URL = "http://localhost:8000"
GAME_ID  = "91b7e52e-c519-4768-a40e-2151e454a77c"

MAX_ATTEMPTS = 7
SECRET       = random.randint(1, 100)


def login(client):
    print("\n=== GridForge Number Guessing ===")
    email    = input("Email: ").strip()
    password = input("Password: ").strip()
    try:
        client.login(email, password)
        me = client.me()
        print(f"Welcome, {me['username']}!\n")
    except GridForgeError as e:
        print(f"Login failed: {e}")
        raise SystemExit(1)


def play():
    attempts_left = MAX_ATTEMPTS
    while attempts_left > 0:
        try:
            guess = int(input(f"Guess (1-100), {attempts_left} attempts left: "))
        except ValueError:
            print("Enter a number.")
            continue

        attempts_left -= 1

        if guess < SECRET:
            print("Too low!")
        elif guess > SECRET:
            print("Too high!")
        else:
            return MAX_ATTEMPTS - attempts_left  # attempts used

    print(f"\nOut of attempts! The number was {SECRET}.")
    return None


def score_from_attempts(attempts_used):
    # fewer attempts = higher score
    return (MAX_ATTEMPTS - attempts_used + 1) * 1000


def main():
    client = GridForgeClient(BASE_URL)
    login(client)

    print(f"Guess the number between 1 and 100. You have {MAX_ATTEMPTS} attempts.\n")

    attempts_used = play()

    if attempts_used is not None:
        score = score_from_attempts(attempts_used)
        print(f"\nCorrect! You got it in {attempts_used} attempt(s).")
        print(f"Your score: {score}")

        try:
            client.submit_score(GAME_ID, score)
        except Exception as e:
            print("submit_score failed:", getattr(e, "payload", e))
            raise
        print("Score submitted to GridForge!\n")

        rank = client.get_my_rank(GAME_ID)
        print(f"Your rank: #{rank['rank']} (best score: {rank['score']})")

    print("\n--- Leaderboard (top 5) ---")
    for row in client.get_leaderboard(GAME_ID, limit=5):
        print(f"  #{row['rank']}  {row['username']:<15} {row['score']}")

    print()


if __name__ == "__main__":
    main()

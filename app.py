from cs50 import SQL
from flask import Flask, render_template, request, redirect, session
from flask_session import Session
import random

app = Flask(__name__)

db = SQL("sqlite:///database/he.db")

app.config["SESSION_PERMANENT"]= False
app.config["SESSION_TYPE"]= "filesystem"
Session(app)


@app.route("/", methods=["POST","GET"])
def index():
    username = session.get('username','')  # Safely get the username from the session
    avatar=session.get('avatar',"static/default-avatar.jpg")

    logged_in = bool(username)

     # Fetch the logged-in user's highest wins
    if username:
        user_highest_roulette = db.execute("SELECT highest_win_roulette FROM game WHERE username = ?", username)[0]['highest_win_roulette']
        user_highest_reel = db.execute("SELECT highest_win_reel FROM game WHERE username = ?", username)[0]['highest_win_reel']
        user_highest_mines = db.execute("SELECT highest_win_mines FROM game WHERE username = ?", username)[0]['highest_win_mines']
        
        # Get the highest wins of other players
        highest_roulette_player = db.execute("SELECT username, highest_win_roulette FROM game ORDER BY highest_win_roulette DESC LIMIT 1")
        highest_reel_player = db.execute("SELECT username, highest_win_reel FROM game ORDER BY highest_win_reel DESC LIMIT 1")
        highest_mines_player = db.execute("SELECT username, highest_win_mines FROM game ORDER BY highest_win_mines DESC LIMIT 1")
    else:
        user_highest_roulette = user_highest_reel = user_highest_mines = 0
        highest_roulette_player = highest_reel_player = highest_mines_player = None

    return render_template("index.html", username=username,avatar=avatar,user_highest_roulette=user_highest_roulette,
                           user_highest_reel=user_highest_reel,
                           user_highest_mines=round(user_highest_mines, 1),
                           highest_roulette_player=highest_roulette_player,
                           highest_reel_player=highest_reel_player,
                           highest_mines_player=highest_mines_player,logged_in=logged_in)
    

@app.route("/register", methods=["POST", "GET"])
def register():
    if request.method == "POST":
        email = request.form.get("email")
        username = request.form.get("username")
        password = request.form.get("password")
        dob = request.form.get("dob")
        
        # Check if any field is missing
        if not email or not username or not password or not dob:
            return render_template("failure.html",error="Please fill all the details ")
        
        existing_email = db.execute("SELECT * FROM game WHERE email = ?", email)
        if existing_email:
            return "Email is already registered. Please use a different email.",409
        
        # Check if username already exists
        existing_username = db.execute("SELECT * FROM game WHERE username = ?", username)
        if existing_username:
            return "Username is already taken. Please try a different username.",409
        
        # Insert data into the database
        try:
            db.execute("INSERT INTO game (email, username, password, dob) VALUES (?, ?, ?, ?)",
            email, username, password, dob)
            session['username']=username
            return render_template("index.html",username=username)
        except Exception as e:
            # Handle potential exceptions (e.g., unique constraint violations)
            return render_template("failure.html", error="An unexpected error occurred: " + str(e))

    
    return render_template("register.html")
    
@app.route("/signin", methods=["POST", "GET"])
def signin():
    
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        # Check if any field is missing
        if not email or not password:
            return "Please fill all the details"
        
        # Verify user credentials (this is a basic example, consider using hashed passwords in production)
        user = db.execute("SELECT * FROM game WHERE email = ?", email)
        if not user:
            # Email not found in the database
            return "User is not registered. Please register first.",404
        elif user[0]['password'] != password:
            # Email exists but password is incorrect
            return "Incorrect password. Please try again.",401
        
        # Login successful, store username in session
        session['username'] = user[0]['username']
        session["avatar_url"] = user[0].get("avatar_url", "static/default-avatar.jpg")
        return render_template("index.html",username=session['username'], avatar_url=session["avatar_url"])  # Redirect to the homepage
        
    
    return render_template("signin.html")

@app.route("/update-avatar", methods=["POST"])
def update_avatar():
    username = session.get("username")  # Retrieve the logged-in username
    if not username:
        return redirect("/signin")  # Redirect if the user is not logged in

    avatar = request.form.get("avatar")  # Get avatar URL from the form
    if not avatar:
        return "Please select an avatar.", 400

    # Update the avatar URL in the database
    db.execute("UPDATE game SET avatar = ? WHERE username = ?", avatar, username)

    # Update the session to reflect the new avatar
    session["avatar"] = avatar

    return redirect("/")  # Redirect to the homepage



@app.route("/about", methods=["GET"])
def about():
        return render_template("about.html")

@app.route("/game")
def game():
    # Fetch data from the database (for logged-in users)
    game_data = db.execute("SELECT email, username, password, dob ,highest_win_roulette,highest_win_reel,highest_win_mines FROM game")

    # Pass the data to the template
    return render_template("game.html", game=game_data)



@app.route("/logout")
def logout():
    session.pop('username', None)  # Clear the username from the session
    return redirect("/")


highest_win = 0

@app.route("/roulette", methods=["POST","GET"])
def home():
    return render_template("roulette.html",highest_win=highest_win)

# Route to save and print the highest win amount
@app.route('/save_win', methods=["POST","GET"])
def save_win():
    global highest_win

    # Get the win amount from the request data (using form data)
    win_amount = int(request.form.get('win_amount'))

    # Check if the current win amount is higher than the saved highest win amount
    username = session.get("username")
    if username:
        current_highest = db.execute("SELECT highest_win_roulette FROM game WHERE username = ?", username)[0]['highest_win_roulette']
        if win_amount > current_highest:
            db.execute("UPDATE game SET highest_win_roulette = ? WHERE username = ?", win_amount, username)
            highest_win = win_amount
        # Print the new highest win amount to the terminal
        print(f"New highest win amount: ${highest_win}")
    
    return "Win amount processed", 200

@app.route('/restart_g', methods=["POST"])
def restart_g():
    print("Frontend state has been reset, but backend data remains unaffected.")
    print(f"New highest win amount: ${highest_win}")
    return "Game restarted", 200


highest_win1 = 0

@app.route("/start_mines", methods=["POST","GET"])
def mines():
    return render_template("m.html",highest_win1=highest_win1)

@app.route('/store_win', methods=['POST'])
def store_win():
    global highest_win1
    win_amount1 = float(request.form['win_amount'])

    username = session.get("username")
    if username:
        current_highest = db.execute("SELECT highest_win_mines FROM game WHERE username = ?", username)[0]['highest_win_mines']
        if win_amount1 > current_highest:
            db.execute("UPDATE game SET highest_win_mines = ? WHERE username = ?", round(win_amount1, 1), username)
            highest_win1 = round(win_amount1, 1)

    print(f"Stored Win Amount: {win_amount1}")
    print(f"Highest win Win Amount: {highest_win1}")
    return "Win amount stored successfully!"

@app.route('/highest_win', methods=['GET'])
def get_highest_win():
    print(f"Highest Win Amount: {highest_win1}")
    return f"Highest Win Amount: {highest_win1}"



SYMBOLS = ["🍒", "🔔", "7", "🍉", "⭐", "💎"]
highest_win3 = 0  # Track the highest win amount

@app.route("/rell", methods=["POST","GET"])
def rell():
    session['chances'] = 3
    return render_template('tr.html')  # Ensure 'tr.html' is inside the 'templates' folder

@app.route("/spin", methods=["POST" , "GET"])
def spin():
    global highest_win3  # Allow modification of the global variable
    

    bet_raw = request.form.get("bet", "").strip()
    if not bet_raw.isdigit():
        return f"Invalid bet amount. Please enter a number between 1 and 1000.", 400

    bet_amount = int(bet_raw)
    if bet_amount < 1 or bet_amount > 1000:
        return f"Bet must be between 1 and 1000.", 400
    
    reel1, reel2, reel3 = random.choices(SYMBOLS, k=3)
    is_win = reel1 == reel2 == reel3
    win_amount = bet_amount * 10 if is_win else 0

    # Update highest win if the current win is larger
    # Update user's highest win if necessary
    username = session.get("username")
    if username:
        current_highest = db.execute("SELECT highest_win_reel FROM game WHERE username = ?", username)[0]['highest_win_reel']
        if win_amount > current_highest:
            db.execute("UPDATE game SET highest_win_reel = ? WHERE username = ?", win_amount, username)
            highest_win3 = win_amount
            print(f"highest win amount:{highest_win3}")

    message = (f"You won!: ${win_amount}") if is_win else "No luck this time!"

    # Print results in the backend
    print(f"Spin Reels: {reel1}, {reel2}, {reel3} | Win Amount: {win_amount} | Highest Win: {highest_win3}")

    return f"{reel1};{reel2};{reel3};{win_amount};{message}"


@app.route('/rest', methods=['POST'])
def reset_game():
        # Reset the game state in the session (or however you're tracking state)
        session['chances'] = 3
        session['wins'] = 0
        # You could reset any other state related to the game here
        
        return redirect("/rell") # Respond with a 200 OK status
    
if __name__ == "__main__":
    app.run(debug=True)


var SCHEMA = new Array();
var QUERY = new Array();



// The pre-defined schema
SCHEMA["Bars"] = "Likes(person, drink)" + "\n"
			 + "Frequents(person, bar)" + "\n"
			 + "Serves(bar, drink, cost)";

SCHEMA["IMDB"] = "Actor(aid, fname, lname)" + "\n"
		      + "Movie(id, name, year, rating)" + "\n"
		      + "Casts(pid, mid, role)";

SCHEMA["Sailors"] = "Sailors(sid, sname, rating, age)" + "\n"
		      + "Boats(bid, bname, color)" + "\n"
		      + "Reserves(sid, bid, day)";

SCHEMA["Belief worlds"] = "Worlds(wid, tid)";

SCHEMA["Abstract"] = "R(A,B,C)" + "\n"
		      + "S(A,B,C)" + "\n"
		      + "T(A,B,C)" + "\n"
		      + "U(A,B,C)";
			  
			  

// Sample queries
QUERY[0] = "";	// reset




QUERY[101] = 
	"SELECT	person\n" +
	"FROM	Frequents"
	
QUERY[102] = 
	"SELECT	*\n" + 
	"FROM	Frequents, Serves\n" +
	"WHERE	Frequents.bar = Serves.bar";
	
// Persons who frequent some bar that serves some drink they like.
QUERY[103] = 
	"SELECT	F.person\n" +
	"FROM	Frequents F, Likes L, Serves S\n" +
	"WHERE	F.person = L.person\n" +
	"AND	F.bar = S.bar\n" +
	"AND	L.drink = S.drink";
	
// Persons who frequent some bar that serves some drink they like.
QUERY[104] = 	
	"SELECT 	F1.person\n" +
	"FROM 	Frequents F1\n" +
	"WHERE 	exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	Serves S2\n" +
	"	WHERE 	S2.bar = F1.bar\n" +
	"	AND 	exists\n" +
	"		(SELECT	*\n" +
	"		FROM 	Likes L3\n" +
	"		WHERE 	L3.person = F1.person\n" +
	"		AND 	S2.drink = L3.drink))";

// Persons who frequent only bars that serve some drink they like.
QUERY[111] = 
	"SELECT	distinct F1.person\n" +
	"FROM 	Frequents F1\n" +
	"WHERE 	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	Frequents F2\n" +
	"	WHERE	F2.person = F1.person\n" +
	"	AND 	not exists\n" +
	"		(SELECT	*\n" +
	"		FROM 	Serves S3, Likes L4\n" +
	"		WHERE 	S3.drink = L4.drink\n" +
	"		AND 	S3.bar = F2.bar\n" +
	"		AND 	L4.person = F2.person))";
	
// Persons who frequent only bars that serve some drink they like.
QUERY[112] = 
	"SELECT	F1.person\n" +
	"FROM 	Frequents F1\n" +
	"WHERE 	not exists\n" +
	"	(SELECT	F2.bar\n" +
	"	FROM 	Frequents F2\n" +
	"	WHERE	F2.person = F1.person\n" +
	"	AND 	not exists\n" +
	"		(SELECT	S3.drink\n" +
	"		FROM 	Serves S3, Likes L4\n" +
	"		WHERE 	S3.drink = L4.drink\n" +
	"		AND 	S3.bar = F2.bar\n" +
	"		AND 	L4.person = F2.person))";	

// Persons who frequent some bar that serves only drinks they like.	
QUERY[121] = 	
	"SELECT	F.person\n" +
	"FROM 	Frequents F\n" +
	"WHERE 	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	Serves S\n" +
	"	WHERE	S.bar = F.bar\n" +
	"	AND	not exists\n" +
	"		(SELECT	L.drink\n" +
	"		FROM	Likes L\n" +
	"		WHERE	L.person = F.person\n" +
	"		AND 	S.drink = L.drink))";	
	
// Bars that serve a drink liked by Joe, but none liked by Michael.
QUERY[131] = 	
	"SELECT	S.bar\n" +
	"FROM	Serves S, Likes L\n" +
	"WHERE	S.drink = L.drink\n" +
	"AND 	L.person = 'Joe'\n" + 
	"AND	not exists\n" +
	"	(SELECT S2.bar\n" +
	"	FROM	Serves S2, Likes L2\n" +
	"	WHERE	S2.drink = L2.drink\n" +
	"	AND 	L2.person = 'Michael'\n" +
	"	AND	S.bar = S2.bar)";
	
// Persons who frequent a bar with >= 2 beers they like, one < 3$ and one >5$.
QUERY[136] = 
	"SELECT	F.person\n" +
	"FROM 	Frequents F, Serves S1, Serves S2, Likes L1, Likes L2\n" +
	"WHERE	F.bar = S1.bar AND S1.bar = S2.bar\n" +
	"AND 	S1.drink = L1.drink AND S2.drink=L2.drink\n" +
	"AND	S1.drink <> S2.drink AND S1.cost < 3 AND S2.cost > 5\n" +
	"AND	F.person = L1.person AND F.person = L2.person";

// Persons who frequent bars with a drink < 3$ and at least two with > 5$.
QUERY[137] = 
	"SELECT	F.person\n" +
	"FROM	Frequents F, Serves S\n" +
	"WHERE	F.bar = S.bar\n" + 
	"AND	S.cost < 3\n" + 
	"AND	exists\n" +
	"	(SELECT	S1.bar\n" +
	"	FROM 	Serves S1, Serves S2\n" +
	"	WHERE	S1.bar = S2.bar\n" + 
	"	AND 	S1.drink <> S2.drink\n" + 
	"	AND 	S1.cost > 5\n" +
	"	AND	S2.cost > 5\n" +
	"	AND	S.bar = S1.bar)";

// Persons who do not frequent bars with 'Golden' and a more expensive drink.
QUERY[140] = 
	"SELECT	F.person\n" +
	"FROM 	Frequents F\n" +
	"WHERE	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM  	Serves S1, Serves S2\n" +
	"	WHERE	F.bar = S1.bar\n" +
	"	AND 	S1.bar = S2.bar\n" + 
	"	AND 	S2.drink = 'Golden'\n" +
	"	AND	S2.cost < S1.cost)";

// Bars that serve every beer that Joe likes.
QUERY[151] = 
	"SELECT 	S.bar\n" +
	"FROM 	Serves S\n" +
	"WHERE 	not exists\n" +
	"	(SELECT	L.drink\n" +
	"	FROM 	Likes L\n" +
	"	WHERE 	L.person = 'Joe'\n" +
	"	AND 	not exists\n" +
	"		(SELECT	S2.drink\n" +
	"		FROM 	Serves S2\n" +
	"		WHERE 	S2.bar = S.bar\n" +
	"		AND 	S2.drink = L.drink))";

// Persons who like a beer that Joe likes and is served somewhere at > $5.
QUERY[155] = 
	"SELECT	L1.person\n" +
	"FROM 	Likes L1, Serves S, Likes L2\n" + 
	"WHERE	L1.drink = L2.drink\n" +
	"AND 	L2.person = 'Joe'\n" +
	"AND	L1.drink = S.drink\n" +
	"AND	S.cost > 5";

// Persons who like a beer that Joe likes and is served somewhere at > $5.
QUERY[156] = 
	"SELECT	L1.person\n" +
	"FROM 	Likes L1, Serves S, Likes L2\n" + 
	"WHERE	L1.drink = L2.drink\n" +
	"AND 	L2.person = 'Joe'\n" +
	"AND	L2.drink = S.drink\n" +
	"AND	S.cost > 5";

// Drinks that are the unique drinks liked by a person.
QUERY[160] = 
	"SELECT	L.drink\n" +
	"FROM	Likes L\n" +
	"WHERE	not exists(\n" +
	"	SELECT	*\n" +
	"	FROM	Likes L2\n" +
	"	WHERE	L2.person = L.person\n" +
	"	AND	L2.drink <> L.drink)";
	
// Drinks that are the unique drinks liked by a person.
QUERY[161] = 
	"SELECT	L.drink\n" +
	"FROM	Likes L\n" +
	"WHERE	L.drink = ALL (\n" +
	"	SELECT	L2.drink\n" +
	"	FROM	Likes L2\n" +
	"	WHERE	L2.person = L.person)";









QUERY[201] = 
	"SELECT	Actor.fname, Actor.lname, name\n" +
	"FROM	Actor, Movie, Casts, Casts c2, Actor a2\n" +
	"WHERE	Actor.aid = Casts.pid\n" + 
	"AND	id = Casts.mid\n" +
	"AND	Casts.mid = c2.mid\n" +
	"AND	Actor.fname = a2.fname";
QUERY[202] = 
	"SELECT	a.fname, a.lname, m.*\n"+
	"FROM	Actor a, Movie m, Casts c\n"+
	"WHERE	a.aid = c.pid\n"+
	"AND	m.id = c.mid\n"+
	"AND	m.year < 1900";
// Movies in which Kevin Bacon plays, together with all its actors.
QUERY[203] = 
	"SELECT	Movie.name, Actor.fname, Actor.lname\n" +
	"FROM	Actor, Movie, Casts c1, Casts c2, Actor bacon\n" +
	"WHERE	bacon.fname = 'Kevin'\n" +
	"AND	bacon.lname = 'Bacon'\n" +
	"AND	c2.pid = bacon.aid\n" +
	"AND	c1.mid = c2.mid\n" +
	"AND	Movie.id = c1.mid\n" +
	"AND	Actor.aid = c1.pid";
// Movies in which Kevin Bacon plays, together with all its actors.
QUERY[204] = 
	"SELECT	Movie.name, Actor.fname, Actor.lname\n" +
	"FROM 	Actor, Movie, Casts c1, Casts c2\n" +
	"WHERE 	c1.mid = c2.mid\n" +
	"AND 	Movie.id = c1.mid\n" +
	"AND 	Actor.aid = c1.pid\n" +
	"AND 	exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	Actor bacon\n" +
	"	WHERE 	bacon.fname = 'Kevin'\n" +
	"	AND 	bacon.lname = 'Bacon'\n" + 
	"	AND 	c2.pid = bacon.aid)";
// Actors with Kevin Bacon number 1.
QUERY[205] =	
	"SELECT	Actor.fname, Actor.lname\n" + 
	"FROM 	Actor, Casts c1, Casts c2, Actor bacon\n" + 
	"WHERE 	c1.mid = c2.mid\n" + 
	"AND 	Actor.aid = c1.pid\n" + 
	"AND 	bacon.fname = 'Kevin'\n" + 
	"AND 	bacon.lname = 'Bacon'\n" +  
	"AND 	c2.pid = bacon.aid\n" + 
	"AND	not exists\n" + 
	"	(SELECT	*\n" + 
	"	FROM 	Actor nonbacon\n" + 
	"	WHERE 	nonbacon.fname = 'Kevin'\n" + 
	"	AND 	nonbacon.lname = 'Bacon' \n" + 
	"	AND 	Actor.aid = nonbacon.aid)";
// Actors with Kevin Bacon number 2.
QUERY[206] = 
	"SELECT	distinct a3.fname, a3.lname\n" + 
	"FROM 	Actor a0, Casts c0, Casts c1, Casts c2, Casts c3, Actor a3\n" +
	"WHERE 	a0.fname = 'Kevin' \n" +
	"AND 	a0.lname = 'Bacon' \n" +
	"AND	c0.pid = a0.aid \n" +
	"AND 	c0.mid = c1.mid \n" +
	"AND	c1.pid = c2.pid \n" +
	"AND	c2.mid = c3.mid \n" +
	"AND	c3.pid = a3.aid \n" +
	"AND	not exists\n" +
	"	(SELECT *\n" +
	"	FROM  	Actor xa0, Casts xc0, Casts xc1\n" +
	"	WHERE 	xa0.fname = 'Kevin' \n" +
	"	AND 	xa0.lname = 'Bacon' \n" +
	"	AND 	xa0.aid = xc0.pid \n" +
	"	AND 	xc0.mid = xc1.mid \n" +
	"	AND 	xc1.pid = a3.aid)\n" +
	"AND	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	Actor ya0\n" +
	"	WHERE	ya0.fname = 'Kevin'\n" +
	"	AND 	ya0.lname = 'Bacon'\n" +
	"	AND 	ya0.aid = a3.aid)";
// Movies and its actors in which Kevin Bacon does not play.
QUERY[207] = 	
	"SELECT	Movie.name, Actor.fname, Actor.lname\n" +
	"FROM 	Actor, Movie, Casts c1, Casts c2\n" +
	"WHERE 	c1.mid = c2.mid\n" +
	"AND 	Movie.id = c1.mid\n" +
	"AND 	Actor.aid = c1.pid\n" +
	"AND 	not exists\n" + 
	"	(SELECT	*\n" +
	"	FROM 	Actor bacon\n" +
	"	WHERE 	bacon.fname = 'Kevin'\n" +
	"	AND 	bacon.lname = 'Bacon'\n" + 
	"	AND c2.pid = bacon.aid)";



	
// Sailors who have reserved all boats.	
QUERY[301] = 
	"SELECT	S.sname\n" +
	"FROM 	Sailors S\n" +
	"WHERE	not exists\n" +
	"	(SELECT	B.bid\n" +
	"	FROM  	Boats B\n" +
	"	WHERE	not exists\n" +
	"		(SELECT	R.bid\n" +
	"		FROM  	Reserves R\n" +
	"		WHERE 	R.bid = B.bid\n" +
	"		AND   	R.sid = S.sid))";
// Sailors who have reserved all red boats.
QUERY[302] = 
	"SELECT	S.sname\n" +
	"FROM 	Sailors S\n" +
	"WHERE	not exists\n" +
	"	(SELECT	B.bid\n" +
	"	FROM  	Boats B\n" +
	"	WHERE  	B.color ='red'\n" +	
	"	AND 	not exists\n" +
	"		(SELECT	R.bid\n" +
	"		FROM  	Reserves R\n" +
	"		WHERE 	R.bid = B.bid\n" +
	"		AND   	R.sid = S.sid))";
// Sailors who have not reserved a red boats.
QUERY[303] = 	
	"SELECT	S.sname\n" +
	"FROM 	Sailors S\n" +
	"WHERE	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM  	Boats B, Reserves R\n" +
	"	WHERE	R.bid = B.bid\n" +
	"	AND	B.color = 'red'\n" +
	"	AND 	R.sid = S.sid)";
	
	
	
	
	
	
	
	
// Worlds where each tuple is already contained in some earlier world.	
QUERY[401] = 
	"SELECT 	W1.wid\n" +
	"FROM 	Worlds 	W1\n" +
	"WHERE 	not exists\n" +
	"	(SELECT W2.tid\n" +
	"	FROM 	Worlds W2\n" +
	"	WHERE 	W2.wid = W1.wid\n" +
	"	AND 	not exists\n" +
	"		(SELECT W3.wid\n" +
	"		FROM 	Worlds W3\n" +
	"		WHERE 	W3.tid = W2.tid\n" +
	"		and 	W3.wid < W2.wid))";

// Worlds for which there exists one other, earlier world that contains all its tuples.
QUERY[411] = 
	"SELECT	W1.wid\n" +
	"FROM 	Worlds W1, Worlds W2\n" +
	"WHERE 	W1.wid > W2.wid\n" +
	"AND	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	Worlds W3\n" +
	"	WHERE 	W3.wid = W1.wid\n" +
	"	AND 	not exists\n" +
	"		(SELECT	*\n" +
	"		FROM 	Worlds W4\n" +
	"		WHERE 	W4.wid = W2.wid\n" +
	"		AND 	W4.tid = W3.tid))";

// Worlds for which there is no earlier world that contains all its tuples.
QUERY[412] = 
	"select	W1.wid\n" +
	"from 	Worlds W1\n" +
	"where 	not exists\n" +
	"	(select	*\n" +
	"	from 	Worlds W2\n" +
	"	where 	W2.wid < W1.wid\n" +
	"	and	not exists\n" +
	"		(select	*\n" +
	"		from 	Worlds W3\n" +
	"		where 	W3.wid = W1.wid\n" +
	"		and	not exists\n" +
	"			(select	*\n" +
	"			from 	Worlds W4\n" +
	"			where 	W4.wid = W2.wid\n" +
	"			and 	W4.tid = W3.tid)))";

// Worlds for which there is no earlier world with exactly the same tuples.
QUERY[416] = 
	"select	W1.*\n" +
	"from 	Worlds W1\n" +
	"where 	not exists\n" +
	"	(select	W2.wid\n" +
	"	from 	Worlds W2\n" +
	"	where 	W2.wid < W1.wid\n" +
	"	and 	not exists\n" +
	"		(select	W3.tid\n" +
	"		from 	Worlds W3\n" +
	"		where 	W3.wid = W1.wid\n" +
	"		and 	not exists\n" +
	"			(select	*\n" +
	"			from 	Worlds W4\n" +
	"			where 	W4.wid = W2.wid\n" +
	"			and 	W4.tid = W3.tid))\n" +
	"	and 	not exists\n" +
	"		(select	W5.tid\n" +
	"		from 	Worlds W5\n" +
	"		where 	W5.wid = W2.wid\n" +
	"		and 	not exists\n" +
	"			(select	*\n" +
	"			from 	Worlds W6\n" +
	"			where 	W6.wid = W1.wid\n" +
	"			and 	W6.tid = W5.tid)))";

// Worlds with a tuple that does not appear in a later world.
QUERY[451] = 
	"SELECT	W1.wid\n" +
	"FROM 	Worlds W1\n" +
	"WHERE	W1.wid >= all\n" +
	"	(SELECT	W2.wid\n" +
	"	FROM	Worlds W2\n" +
	"	WHERE	W2.tid = W1.tid)";



	
// Attribute value between numerical values.
QUERY[501] = 
	"SELECT	R.A\n" +
	"FROM 	R\n" +
	"WHERE	A > 1\n" +
	"AND	A < 10";

// Attribute comparisons.
QUERY[503] = 
	"SELECT	R.A\n" +
	"FROM 	R\n" +
	"WHERE	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	S\n" +
	"	WHERE	R.A < S.A\n" +
	"	AND	S.B < S.A\n" +
	"	AND 	S.C < 10)";	

// Attribute comparisons inside a component.
QUERY[505] = 
	"SELECT	R.A\n" +
	"FROM 	R, S, T\n" +
	"WHERE 	R.A = S.A\n" +
	"AND 	S.C > T.C\n" +
	"And	R.A = T.A";

// Attribute comparisons inside a component.
QUERY[506] = 
	"SELECT	R.A\n" +
	"FROM 	R\n" +
	"WHERE 	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	R R2\n" +
	"	WHERE	R2.A = R.A\n" +
	"	AND	not exists\n" +
	"		(SELECT	*\n" +
	"		FROM 	S,T\n" +
	"		WHERE	S.C > T.C\n" +
	"		AND	R2.A = S.A\n" +
	"		AND	R2.B = T.B))";
	
// Attribute comparisons inside a component.
QUERY[507] = 
	"SELECT	R.A\n" +
	"FROM 	R\n" +
	"WHERE 	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	R R2\n" +
	"	WHERE	R2.A = R.A\n" +
	"	AND	not exists\n" +
	"		(SELECT	*\n" +
	"		FROM 	S,T\n" +
	"		WHERE	T.C > S.C\n" +
	"		AND	R2.A = S.A\n" +
	"		AND	R2.B = T.B))";		
	
// Attribute comparisons between components.
QUERY[508] = 
	"SELECT 	R.A\n" +
	"FROM 	R\n" +
	"WHERE 	not exists\n" +
	"	(SELECT	*\n" +
	"	FROM 	S\n" +
	"	WHERE	S.A = R.A\n" +
	"	AND	not exists\n" +
	"		(SELECT	*\n" +
	"		FROM 	T\n" +
	"		WHERE	S.C > T.C\n" +
	"		AND	R.B = T.B))";
	
// Multiple conjunctive selections on predicates.
QUERY[511] = 
	"SELECT	R.A\n" +
	"FROM 	R,S\n" +
	"WHERE	R.A > 2\n" +
	"AND	R.A < 10\n" +
	"AND	S.A = 3\n" +
	"AND	R.A = S.A";
	
// R.A with R.B biggest among all R.Bs.
QUERY[551] = 
	"SELECT	R.A\n" +
	"FROM	R\n" +
	"WHERE	R.B > ALL\n" +
	"	(SELECT	R2.B\n" +
	"	FROM	R as R2)";	
	
// R.A where R.B is different from at least one S.B.
QUERY[561] = 
	"SELECT	R.A\n" +
	"FROM 	R, S\n" +
	"WHERE	R.B <> S.B";	
	
// R.A where R.B is different from at least one S.B.
QUERY[562] = 
	"SELECT	R.A\n" +
	"FROM 	R\n" +
	"WHERE	exists\n" +
	"	(SELECT	*\n" +
	"	FROM	S\n" +
	"	WHERE 	R.B <> S.B)";
	
// R.A so that R.B is different from all S.B.
QUERY[571] = 
	"SELECT	R.A\n" +
	"FROM	R\n" +
	"WHERE	R.B <> ALL\n" +
	"	(SELECT	S.B\n" +
	"	FROM	S)";
	
// R.A for which R.B is not in S.B.
QUERY[573] = 
	"SELECT	R.A\n" +
	"FROM	R\n" +
	"WHERE	not exists\n" +
	"	(SELECT	S.B\n" +
	"	FROM	S\n" +
	"	WHERE	S.B = R.B)";


QUERY[574] = 
`SELECT 	R.A
FROM 	R, T
WHERE 	R.A = T.A 
AND not exists
	(SELECT	*
	FROM 	S, T, U
	WHERE	S.A = R.A
	AND	S.B = T.B
	AND S.A = U.A)
`

	
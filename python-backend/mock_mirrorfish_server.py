"""
Mock MirrorFish Server for Testing SkillOS Integration
Run this to simulate MirrorFish API responses when the real MirrorFish is not available
"""

from flask import Flask, request, jsonify
import time
import uuid
import random

app = Flask(__name__)

# In-memory storage for simulations
simulations = {}
graphs = {}


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {"status": "healthy", "service": "mock_mirrorfish", "version": "1.0.0"}
    )


@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({"status": "running", "active_simulations": len(simulations)})


@app.route("/api/graph/build", methods=["POST"])
def build_graph():
    data = request.get_json()
    graph_id = str(uuid.uuid4())

    graphs[graph_id] = {
        "id": graph_id,
        "text": data.get("text", ""),
        "status": "building",
        "created_at": time.time(),
    }

    # Simulate async processing
    def complete_graph():
        time.sleep(2)  # Simulate processing time
        if graph_id in graphs:
            graphs[graph_id]["status"] = "complete"

    import threading

    threading.Thread(target=complete_graph).start()

    return jsonify({"graph_id": graph_id, "status": "building"})


@app.route("/api/graph/status/<graph_id>", methods=["GET"])
def graph_status(graph_id):
    if graph_id not in graphs:
        return jsonify({"error": "Graph not found"}), 404

    graph = graphs[graph_id]
    return jsonify(
        {
            "graph_id": graph_id,
            "status": graph["status"],
            "created_at": graph["created_at"],
        }
    )


@app.route("/api/simulation/start", methods=["POST"])
def start_simulation():
    data = request.get_json()
    simulation_id = str(uuid.uuid4())

    simulations[simulation_id] = {
        "id": simulation_id,
        "graph_id": data.get("graph_id"),
        "query": data.get("prediction_query", ""),
        "rounds": data.get("num_rounds", 15),
        "status": "running",
        "started_at": time.time(),
    }

    # Simulate async processing
    def complete_simulation():
        time.sleep(5)  # Simulate processing time
        if simulation_id in simulations:
            simulations[simulation_id]["status"] = "complete"

    import threading

    threading.Thread(target=complete_simulation).start()

    return jsonify({"simulation_id": simulation_id, "status": "running"})


@app.route("/api/simulation/status/<simulation_id>", methods=["GET"])
def simulation_status(simulation_id):
    if simulation_id not in simulations:
        return jsonify({"error": "Simulation not found"}), 404

    sim = simulations[simulation_id]
    return jsonify(
        {
            "simulation_id": simulation_id,
            "status": sim["status"],
            "started_at": sim["started_at"],
            "rounds": sim["rounds"],
        }
    )


@app.route("/api/report/generate/<simulation_id>", methods=["POST"])
def generate_report(simulation_id):
    if simulation_id not in simulations:
        return jsonify({"error": "Simulation not found"}), 404

    # Simulate report generation
    time.sleep(1)
    return jsonify({"status": "generated", "simulation_id": simulation_id})


@app.route("/api/report/result/<simulation_id>", methods=["GET"])
def get_report(simulation_id):
    if simulation_id not in simulations:
        return jsonify({"error": "Simulation not found"}), 404

    # Generate mock report based on simulation
    sim = simulations[simulation_id]

    # Mock agent evaluations
    ats_score = random.randint(60, 90)
    hr_score = random.randint(55, 85)
    startup_score = random.randint(50, 80)
    tech_score = random.randint(45, 85)

    overall_prob = (ats_score + hr_score + startup_score + tech_score) // 4

    mock_report = f"""
VIRTUAL HR SIMULATION REPORT
============================

CANDIDATE EVALUATION SUMMARY:
Overall Shortlist Probability: {overall_prob}%

ATS SYSTEM EVALUATION:
Confidence: {ats_score}%
The ATS system found strong keyword matches and proper formatting. 
Resume structure is excellent with clear sections and relevant technical skills.
Recommendation: PASS - Meets initial screening criteria.

HR SCREENER EVALUATION:  
Confidence: {hr_score}%
Cultural fit assessment shows good alignment with company values.
Career progression demonstrates steady growth and learning mindset.
Recommendation: SHORTLIST - Strong candidate for next round.

STARTUP HIRING MANAGER EVALUATION:
Confidence: {startup_score}%
Execution focus is evident from project descriptions and achievements.
Shows ability to ship products and work in fast-paced environments.
Recommendation: HIRE - Good fit for startup culture.

TECHNICAL LEAD EVALUATION:
Confidence: {tech_score}%
Technical depth is solid with relevant experience in required technologies.
System design understanding could be stronger but shows potential.
Recommendation: YES - Technical skills meet requirements.

PANEL CONSENSUS:
The candidate shows strong potential across multiple evaluation criteria.
Key strengths include technical competency and cultural alignment.
Areas for improvement: deeper system design knowledge and cloud experience.
"""

    return jsonify(
        {
            "simulation_id": simulation_id,
            "report": mock_report.strip(),
            "content": mock_report.strip(),
            "result": mock_report.strip(),
            "generated_at": time.time(),
            "shortlist_probability": overall_prob,
        }
    )


@app.route("/api/heartbeat", methods=["GET"])
def heartbeat():
    return jsonify({"status": "alive", "timestamp": time.time()})


if __name__ == "__main__":
    print("🚀 Starting Mock MirrorFish Server...")
    print("📍 Server will run at: http://localhost:5001")
    print("🔧 This is a mock server for testing SkillOS integration")
    print("=" * 50)

    app.run(host="0.0.0.0", port=5001, debug=True)

# Unit tests for Vector API
# Run: pytest tests/test_unit.py -v

import pytest
from vector_api import app, db


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.app_context():
        # Create the tables in the in-memory sqlite db
        db.create_all()
        
        with app.test_client() as client:
            yield client
        
        # Optional: Clean up after the test (though in-memory dies anyway)
        db.drop_all()

def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.get_json()['status'] == 'ok'


def test_vector_basic(client):
    res = client.post('/vector', json={"vector": [1, 2, 3, 4, 5]})
    assert res.status_code == 200
    body = res.get_json()
    assert body['count'] == 5

def test_vector_missing_field(client):
    res = client.post('/vector', json={})
    assert res.status_code == 400


def test_vector_empty(client):
    res = client.post('/vector', json={"vector": []})
    assert res.status_code == 400


def test_vector_invalid_type(client):
    res = client.post('/vector', json={"vector": ["a", "b"]})
    assert res.status_code == 400

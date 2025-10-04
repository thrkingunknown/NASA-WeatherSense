/**
 * Test Script for Weather Backend API
 *
 * This script tests the backend API endpoints
 * Run with: npm run test-api (add this to package.json scripts)
 * Or use: node test-api.js (after compiling TypeScript)
 */

const BASE_URL = "http://localhost:3001/api";

async function testHealthEndpoint() {
  console.log("\n🔍 Testing Health Endpoint...");
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ Health Check:", data);
    return true;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return false;
  }
}

async function testWeatherEndpoint() {
  console.log("\n🔍 Testing Weather Endpoint...");

  const testCases = [
    {
      name: "Valid Request - Kerala, India",
      params: {
        latitude: "10.726563",
        longitude: "76.290312",
        date: "30-09-2026",
      },
    },
    {
      name: "Valid Request - New York, USA",
      params: {
        latitude: "40.7128",
        longitude: "-74.0060",
        date: "15-12-2025",
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n  📍 Test: ${testCase.name}`);
    const url = new URL(`${BASE_URL}/weather`);
    url.searchParams.append("latitude", testCase.params.latitude);
    url.searchParams.append("longitude", testCase.params.longitude);
    url.searchParams.append("date", testCase.params.date);

    try {
      console.log(`  🌐 Calling: ${url.toString()}`);
      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.ok) {
        console.log("  ✅ Success!");
        console.log(
          "  📊 Comfortability Score:",
          data.overall_comfortability_score?.score
        );
        console.log(
          "  📝 Summary:",
          data.overall_comfortability_score?.summary
        );
        console.log(
          "  🌡️ Temperature:",
          data.weather_conditions?.specific_variables?.temperature_celsius,
          "°C"
        );
        console.log(
          "  💧 Rainfall:",
          data.weather_conditions?.specific_variables?.rainfall_mm,
          "mm"
        );
      } else {
        console.log("  ❌ Error:", data);
      }
    } catch (error) {
      console.log("  ❌ Request failed:", error);
    }
  }
}

async function testValidation() {
  console.log("\n🔍 Testing Input Validation...");

  const invalidCases = [
    {
      name: "Missing parameters",
      url: `${BASE_URL}/weather`,
      expectedError: "Missing required parameters",
    },
    {
      name: "Invalid date format",
      url: `${BASE_URL}/weather?latitude=10&longitude=76&date=2026-09-30`,
      expectedError: "Invalid date format",
    },
    {
      name: "Invalid latitude",
      url: `${BASE_URL}/weather?latitude=200&longitude=76&date=30-09-2026`,
      expectedError: "Invalid latitude",
    },
    {
      name: "Invalid longitude",
      url: `${BASE_URL}/weather?latitude=10&longitude=300&date=30-09-2026`,
      expectedError: "Invalid longitude",
    },
  ];

  for (const testCase of invalidCases) {
    console.log(`\n  🧪 Test: ${testCase.name}`);
    try {
      const response = await fetch(testCase.url);
      const data = await response.json();

      if (response.status === 400) {
        console.log("  ✅ Validation working correctly");
        console.log("  📝 Error message:", data.message);
      } else {
        console.log("  ⚠️ Expected 400 status, got:", response.status);
      }
    } catch (error) {
      console.log("  ❌ Request failed:", error);
    }
  }
}

async function runAllTests() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║           Weather Backend API - Test Suite                     ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );

  console.log("\n⏳ Starting tests...\n");

  // Test 1: Health Check
  const healthOk = await testHealthEndpoint();

  if (!healthOk) {
    console.log("\n❌ Server is not running. Please start the server first:");
    console.log("   cd backend && npm run dev\n");
    return;
  }

  // Test 2: Weather Endpoint
  await testWeatherEndpoint();

  // Test 3: Validation
  await testValidation();

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║                    Tests Complete! ✅                          ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );
}

// Run tests
if (typeof window === "undefined") {
  // Node.js environment
  runAllTests().catch(console.error);
} else {
  // Browser environment
  console.log("Run this script in Node.js or browser console");
  window.runWeatherTests = runAllTests;
}
